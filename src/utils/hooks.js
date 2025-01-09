const natural = require('natural');

const applyPhoneticTitleHook = (model) => {
  model.beforeSave(async (instance, _options) => {
    if (instance.title && (instance.isNewRecord || instance.changed('title'))) {
      const metaphone = new natural.Metaphone();
      instance.phonetic_title = metaphone.process(instance.title);
    } else if (
      instance.name &&
      (instance.isNewRecord || instance.changed('name'))
    ) {
      const metaphone = new natural.Metaphone();
      instance.phonetic_title = metaphone.process(instance.name);
    }
  });
};

module.exports = { applyPhoneticTitleHook };
