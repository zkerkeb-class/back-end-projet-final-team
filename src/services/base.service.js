class BaseService {
  constructor(model) {
    this.model = model;
  }

  async create(data) {
    try {
      return await this.model.create(data);
    } catch (error) {
      throw new Error(`Error creating ${this.model.name}: ${error.message}`);
    }
  }

  async findAll(options = {}) {
    try {
      return await this.model.findAll(options);
    } catch (error) {
      throw new Error(`Error fetching ${this.model.name}s: ${error.message}`);
    }
  }

  async findById(id, options = {}) {
    try {
      const item = await this.model.findByPk(id, options);
      if (!item) throw new Error(`${this.model.name} not found`);
      return item;
    } catch (error) {
      throw new Error(`Error fetching ${this.model.name}: ${error.message}`);
    }
  }

  async update(id, data) {
    try {
      const [updated] = await this.model.update(data, {
        where: { id },
        returning: true,
      });
      if (!updated) throw new Error(`${this.model.name} not found`);
      return this.findById(id);
    } catch (error) {
      throw new Error(`Error updating ${this.model.name}: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      const deleted = await this.model.destroy({
        where: { id },
      });
      if (!deleted) throw new Error(`${this.model.name} not found`);
      return { message: `${this.model.name} deleted successfully` };
    } catch (error) {
      throw new Error(`Error deleting ${this.model.name}: ${error.message}`);
    }
  }

  async findOne(options = {}) {
    try {
      const item = await this.model.findOne(options);
      if (!item) throw new Error(`${this.model.name} not found`);
      return item;
    } catch (error) {
      throw new Error(`Error fetching ${this.model.name}: ${error.message}`);
    }
  }
}

module.exports = BaseService;
