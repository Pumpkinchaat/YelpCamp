// This is the verification schema file
// this is powered by Joi npm package
const baseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const Joi = baseJoi.extend(extension)

module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required().escapeHTML(),
        price: Joi.number().required().min(0),
        image: Joi.object({
            url: Joi.string().required(),
            filename: Joi.string().required()
        }),
        location: Joi.string().required().escapeHTML(),
        geometry: Joi.object({
            type: Joi.string().required(),
            coordinates: Joi.array().items(Joi.number()).required()
        }),
        author: Joi.string(),
        description: Joi.string().required().escapeHTML()
    }).required(),
    deleteimages: Joi.array().items(Joi.string())
});

module.exports.reviewSchema = Joi.object({
    review : Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body : Joi.string().required()
    }).required()
});