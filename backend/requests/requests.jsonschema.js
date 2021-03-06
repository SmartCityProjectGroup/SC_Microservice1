
const NewRequestSchema = {
    id: '/NewRequestSchema',
    type: 'object',
    properties: {
        citizen_id: { type: 'integer', minimum: 1 },
        reason: { type: 'string', maxLength: 255 },
        firstname: { type: 'string', minLength: 1, maxLength: 100 },
        lastname: { type: 'string', minLength: 1, maxLength: 100 },
        street: { type: 'string', minLength: 1, maxLength: 100 },
        house_number: { type: 'string', minLength: 1, maxLength: 5 },
        city_code: { type: 'string', minLength: 1, format: /^[0-9]{5}$/ },
        city: { type: 'string', minLength: 1, maxLength: 100 }
    },
    required: ['citizen_id']
};

const RequestIDSchema = {
    id: '/RequestIDSchema',
    type: 'string',
    pattern: '^[1-9]\\d*$'
};

export { NewRequestSchema, RequestIDSchema };
