import { validate } from 'jsonschema';
import { NewPermitSchema, UpdatePermitSchema, PermitID, RequestPermitSchema, ApprovePermitSchema } from './permits.jsonschema.js';
import { CitizenIDSchema } from '../citizen/citizen.jsonschema.js';

/* -------------------------------------------------------------------------- */
/*                          permits.controller.js                             */
/*             validates the given input and gathers the output               */
/* -------------------------------------------------------------------------- */

export async function createPermit(request, response) {
    //validate posted parameters
    const input = request.body;
    const result = validate(input, NewPermitSchema);
    if (result.errors.length > 0) {
        let errors = result.errors.map(error => error.stack);
        return response.status(400).json({ errors: errors });
    }

    //create permit in database
    let permit;
    try {
        permit = await request.permitModel.createPermit(input.title, input.description || null);
        if (permit == null) { return response.status(400).json({ errors: ['Could not create permit'] }); }
    } catch (error) {
        console.error(error);
        return response.status(500).json({ errors: ['Could not create permit'] });
    }

    //send response
    response.status(200).json({ permit: permit });
};

export async function getPermitById(request, response) {
    //validate permit_id from url parameters
    const permit_id = request.params.id;
    const result = validate(permit_id, PermitID);
    if (result.errors.length > 0) {
        let errors = result.errors.map(error => error.stack);
        return response.status(400).json({ errors: errors });
    }

    //get permit from database
    let permit;
    try {
        permit = await request.permitModel.getPermitById(permit_id);
        if (permit == null) { return response.status(404).json({ errors: ['Permit was not found.'] }); }
    } catch (error) {
        console.error(error);
        return response.status(500).json({ errors: ['Could not get permit from database'] });
    }

    //send response
    response.status(200).json({ permit: permit });
};

export async function updatePermit(request, response) {
    //validate permit_id from url parameters
    const permit_id = request.params.id;
    const result1 = validate(permit_id, PermitID);
    if (result1.errors.length > 0) {
        let errors = result1.errors.map(error => error.stack);
        return response.status(400).json({ errors: errors });
    }
    //validate posted parameters
    const input = request.body;
    const result2 = validate(input, UpdatePermitSchema);
    if (result2.errors.length > 0) {
        let errors = result2.errors.map(error => error.stack);
        return response.status(400).json({ errors: errors });
    }

    //update permit in database
    let permit;
    try {
        permit = await request.permitModel.updatePermit(permit_id, input.title, input.description || null);
        if (permit == null) { return response.status(400).json({ errors: ['Could not update permit'] }); }
    } catch (error) {
        console.error(error);
        return response.status(500).json({ errors: ['Could not update permit'] });
    }

    //send response
    response.status(200).json({ permit: permit });
};

export async function deletePermit(request, response) {
    //validate permit_id from url parameters
    const permit_id = request.params.id;
    const result = validate(permit_id, PermitID);
    if (result.errors.length > 0) {
        let errors = result.errors.map(error => error.stack);
        return response.status(400).json({ errors: errors });
    }

    //delete permit from database
    let success;
    try {
        success = await request.permitModel.deletePermit(permit_id);
    } catch (error) {
        console.error(error);
        return response.status(500).json({ errors: ['Could not delete permit'] });
    }

    //send response
    response.status(200).json({ deleted: success });
};

export async function getAllPermits(request, response) {
    //get all permits from database
    let permits;
    try {
        permits = await request.permitModel.getAllPermits();
        if (permits == null) { return response.status(404).json({ errors: ['No permits were found.'] }); }
    } catch (error) {
        console.error(error);
        return response.status(500).json({ errors: ['Could not get all permits'] });
    }

    //send response
    response.status(200).json({ permits: permits });
}

export async function createPermitRequest(request, response) {
    //validate parameters from body
    const input = request.body;
    const result = validate(input, RequestPermitSchema);
    if (result.errors.length > 0) {
        let errors = result.errors.map(error => error.stack);
        return response.status(400).json({ errors: errors });
    }

    //create permit request in database
    let success;
    try {
        let description = input.description || null;
        success = await request.permitModel.createPermitRequest(input.permit_id, input.citizen_id, description);
        if (!success) { return response.status(400).json({ errors: ['Could not create permit request'] }); }
    } catch (error) {
        console.error(error);
        return response.status(500).json({ errors: ['Could not create permit request'] });
    }

    //send response
    response.status(200).json({ success: success });
};

export async function getAllOpenPermitRequests(request, response) {
    //get all open permit requests from database
    let requests;
    try {
        requests = await request.permitModel.getAllOpenPermitRequests();
        if (requests == null) { return response.status(404).json({ errors: ['No permit requests found'] }); }
    } catch (error) {
        console.error(error);
        return response.status(500).json({ errors: ['Could not get permit requests from database'] });
    }

    //check if there are any requests
    if (!Array.isArray(requests)) { return response.status(500).json({ errors: ['Could not get permit requests from database'] }); }

    //send response
    response.status(200).json({ requests: requests });
};

export async function approvePermitRequest(request, response) {
    //validate permit_id from url parameters
    const permits_id = request.params.id;
    const result = validate(permits_id, PermitID);
    if (result.errors.length > 0) {
        let errors = result.errors.map(error => error.stack);
        return response.status(400).json({ errors: errors });
    }

    //validate parameters from body
    const input = request.body;
    const result2 = validate(input, ApprovePermitSchema);
    if (result2.errors.length > 0) {
        let errors = result2.errors.map(error => error.stack);
        return response.status(400).json({ errors: errors });
    }

    //approve permit request in database
    let success;
    try {
        let valid_until = input.valid_until || null;
        success = await request.permitModel.approvePermitRequest(permits_id, valid_until);
        if (!success) { return response.status(400).json({ errors: ['Could not approve permit request'] }); }
    } catch (error) {
        console.error(error);
        return response.status(500).json({ errors: ['Could not approve permit request'] });
    }

    //send response
    response.status(200).json({ success: success });
};

export async function rejectPermitRequest(request, response) {
    //validate permit_id from url parameters
    const permits_id = request.params.id;
    const result = validate(permits_id, PermitID);
    if (result.errors.length > 0) {
        let errors = result.errors.map(error => error.stack);
        return response.status(400).json({ errors: errors });
    }

    //reject permit request in database
    let success;
    try {
        success = await request.permitModel.rejectPermitRequest(permits_id);
        if (!success) { return response.status(400).json({ errors: ['Could not reject permit request'] }); }
    } catch (error) {
        console.error(error);
        return response.status(500).json({ errors: ['Could not reject permit request'] });
    }

    //send response
    response.status(200).json({ success: success });
};
