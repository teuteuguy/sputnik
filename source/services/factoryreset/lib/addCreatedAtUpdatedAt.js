module.exports = function addCreatedAtUpdatedAt(template) {
    const date = new Date();
    const now = date.toISOString();
    template.createdAt = now;
    template.updatedAt = now;
    return template;
};
