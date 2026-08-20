const { Models } = require('../models/dbModel');
const { NotFoundError } = require('../adapters/errorAdapter');
const CacheHelper = require('../helpers/cacheHelper');

/**
 * Category Service for business logic and DB operations
 */
const CategoryService = {
  /**
   * Create a new category
   * @param {Object} categoryData - Data for the new category
   */
  createCategory: async (categoryData) => {
    const { categories } = await Models();
    const category = await categories.create(categoryData);
    await CacheHelper.invalidateCategories(category.id);
    return category;
  },

  /**
   * Get all categories
   * @param {Object} filter - Optional filters
   */
  getAllCategories: async (filter = {}) => {
    const cacheKey = await CacheHelper.categoryListKey(filter);
    const ttl = CacheHelper.ttls().categoryTtl;

    return CacheHelper.getOrSet(cacheKey, ttl, async () => {
      const { categories } = await Models();
      return categories.findAll({ where: filter });
    });
  },

  /**
   * Get category by ID
   * @param {String} id - Category ID
   */
  getCategoryById: async (id) => {
    const cacheKey = CacheHelper.categoryDetailKey(id);
    const ttl = CacheHelper.ttls().categoryTtl;

    const cached = await CacheHelper.get(cacheKey);
    if (cached) return cached;

    const { categories } = await Models();
    const foundCategory = await categories.findByPk(id, {
      include: [{ model: categories, as: 'SubCategories' }]
    });
    if (!foundCategory) {
      throw NotFoundError('Category not found');
    }

    const plain = CacheHelper.toPlain(foundCategory);
    await CacheHelper.set(cacheKey, plain, ttl);
    return plain;
  },

  /**
   * Update category
   * @param {String} id - Category ID
   * @param {Object} updateData - Data to update
   */
  updateCategory: async (id, updateData) => {
    const { categories } = await Models();
    const category = await categories.findByPk(id);
    if (!category) {
      throw NotFoundError('Category not found');
    }

    const updated = await category.update(updateData);
    await CacheHelper.invalidateCategories(id);
    return updated;
  },

  /**
   * Delete category
   * @param {String} id - Category ID
   */
  deleteCategory: async (id) => {
    const { categories } = await Models();
    const category = await categories.findByPk(id);
    if (!category) {
      throw NotFoundError('Category not found');
    }

    const result = await category.destroy();
    await CacheHelper.invalidateCategories(id);
    return result;
  }
};

module.exports = CategoryService;
