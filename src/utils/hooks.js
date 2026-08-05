const natural = require('natural');
const logger = require('./loggerUtil');

const applyPhoneticTitleHook = (model) => {
  const metaphone = new natural.Metaphone();

  // Handle instance creation
  model.beforeCreate(async (instance, _options) => {
    try {
      if (instance.title) {
        instance.phonetic_title = await metaphone.process(instance.title);
      } else if (instance.name) {
        instance.phonetic_title = await metaphone.process(instance.name);
      }
      logger.debug('Phonetic title created:', instance.phonetic_title);
    } catch (error) {
      logger.error('Error in beforeCreate hook:', error);
      throw error;
    }
  });

  // Handle instance update
  model.beforeSave(async (instance, _options) => {
    try {
      if (
        !instance.isNewRecord &&
        (instance.changed('title') || instance.changed('name'))
      ) {
        const newValue = instance.title || instance.name;
        instance.phonetic_title = await metaphone.process(newValue);
        logger.debug('Phonetic title updated:', {
          oldValue: instance._previousDataValues.phonetic_title,
          newValue: instance.phonetic_title,
        });
      }
    } catch (error) {
      logger.error('Error in beforeSave hook:', error);
      throw error;
    }
  });
};

module.exports = { applyPhoneticTitleHook };
