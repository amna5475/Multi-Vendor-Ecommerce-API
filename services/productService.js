const { Models, sequelize } = require('../models/dbModel');
const { NotFoundError, ForbiddenError } = require('../adapters/errorAdapter');
const CacheHelper = require('../helpers/cacheHelper');

/**
 * Product Service for business logic and DB operations
 */
const ProductService = {
  /**
   * Create a new product with variants and images
   * @param {Object} productData - Data for the new product
   * @param {Array} variants - Array of product variants
   * @param {Array} images - Array of product image URLs
   */
  createProduct: async (productData, variants = [], images = []) => {
    const { products, product_variants, product_images } = await Models();
    
    const transaction = await sequelize.transaction();
    try {
      const product = await products.create(productData, { transaction });

      if (variants && variants.length > 0) {
        const variantsWithProductId = variants.map(v => ({ ...v, product_id: product.id }));
        await product_variants.bulkCreate(variantsWithProductId, { transaction });
      }

      if (images && images.length > 0) {
        const imagesWithProductId = images.map(img => ({ ...img, product_id: product.id }));
        await product_images.bulkCreate(imagesWithProductId, { transaction });
      }

      await transaction.commit();
      await CacheHelper.invalidateProducts(product.id);
      return await ProductService.getProductById(product.id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  /**
   * Get all products
   * @param {Object} filter - Optional filters
   */
  getAllProducts: async (filter = {}) => {
    const cacheKey = await CacheHelper.productListKey(filter);
    const ttl = CacheHelper.ttls().productListTtl;

    return CacheHelper.getOrSet(cacheKey, ttl, async () => {
      const { products, product_variants, product_images, brands, categories } = await Models();
      return products.findAll({
        where: filter,
        include: [
          { model: product_variants },
          { model: product_images },
          { model: brands },
          { model: categories }
        ]
      });
    });
  },

  /**
   * Get product by ID
   * @param {String} id - Product ID
   */
  getProductById: async (id) => {
    const cacheKey = CacheHelper.productDetailKey(id);
    const ttl = CacheHelper.ttls().productDetailTtl;

    const cached = await CacheHelper.get(cacheKey);
    if (cached) return cached;

    const { products, product_variants, product_images, brands, categories } = await Models();
    const foundProduct = await products.findByPk(id, {
      include: [
        { model: product_variants },
        { model: product_images },
        { model: brands },
        { model: categories }
      ]
    });
    if (!foundProduct) {
      throw NotFoundError('Product not found');
    }

    const plain = CacheHelper.toPlain(foundProduct);
    await CacheHelper.set(cacheKey, plain, ttl);
    return plain;
  },

  /**
   * Update product with variants and images
   * @param {String} id - Product ID
   * @param {String} sellerId - Seller ID (for ownership check)
   * @param {Object} updateData - Data to update
   */
  updateProduct: async (id, sellerId, updateData) => {
    const { products, product_variants, product_images } = await Models();
    const product = await products.findByPk(id);
    if (!product) {
      throw NotFoundError('Product not found');
    }

    if (product.seller_id !== sellerId) {
      throw ForbiddenError('You do not have permission to update this product');
    }

    const transaction = await sequelize.transaction();
    try {
      const { variants, images, ...productFields } = updateData;

      await product.update(productFields, { transaction });

      if (variants) {
        await product_variants.destroy({ where: { product_id: id }, transaction });
        const variantsWithProductId = variants.map(v => ({ ...v, product_id: id }));
        await product_variants.bulkCreate(variantsWithProductId, { transaction });
      }

      if (images) {
        await product_images.destroy({ where: { product_id: id }, transaction });
        const imagesWithProductId = images.map(img => ({ ...img, product_id: id }));
        await product_images.bulkCreate(imagesWithProductId, { transaction });
      }

      await transaction.commit();
      await CacheHelper.invalidateProducts(id);
      return await ProductService.getProductById(id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  /**
   * Delete product
   * @param {String} id - Product ID
   * @param {String} sellerId - Seller ID (for ownership check)
   */
  deleteProduct: async (id, sellerId) => {
    const { products } = await Models();
    const product = await products.findByPk(id);
    if (!product) {
      throw NotFoundError('Product not found');
    }
    if (product.seller_id !== sellerId) {
      throw ForbiddenError('You do not have permission to delete this product');
    }

    const result = await product.destroy();
    await CacheHelper.invalidateProducts(id);
    return result;
  },

  /**
   * Get products by seller
   * @param {String} sellerId - Seller ID
   */
  getProductsBySeller: async (sellerId) => {
    return await ProductService.getAllProducts({ seller_id: sellerId });
  },

  /**
   * Get all public questions (and answers) for a product
   * @param {String} productId - Product ID
   */
  getProductQuestions: async (productId) => {
    const { product_questions, users } = await Models();
    await ProductService.getProductById(productId); // ensure product exists
    return await product_questions.findAll({
      where: { product_id: productId, is_public: true },
      include: [{
        model: users,
        attributes: ['id', 'full_name']
      }],
      order: [['created_at', 'DESC']]
    });
  },

  /**
   * Ask a question about a product
   */
  askQuestion: async (productId, userId, question) => {
    const { product_questions } = await Models();
    return await product_questions.create({
      product_id: productId,
      user_id: userId,
      question
    });
  },

  /**
   * Answer a product question
   */
  answerQuestion: async (questionId, sellerUserId, answer) => {
    const { product_questions } = await Models();
    const question = await product_questions.findByPk(questionId);
    if (!question) throw NotFoundError('Question not found');
    
    return await question.update({
      answer,
      answered_by: sellerUserId,
      answered_at: new Date()
    });
  }
};

module.exports = ProductService;
