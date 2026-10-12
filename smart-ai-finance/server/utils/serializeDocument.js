const serializeDocument = (document, aliases = {}) => {
  const result = document.toObject ? document.toObject({ virtuals: true }) : { ...document };
  result.id = String(result._id || result.id);
  delete result._id;
  delete result.__v;

  Object.entries(aliases).forEach(([source, target]) => {
    if (Object.prototype.hasOwnProperty.call(result, source)) {
      result[target] = result[source];
      delete result[source];
    }
  });

  return result;
};

module.exports = serializeDocument;
