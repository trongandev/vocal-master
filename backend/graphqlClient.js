const { GraphQLClient } = require('graphql-request')

function createClient(authorization) {
    const headers = {}
    if (authorization) headers.authorization = authorization
    return new GraphQLClient('https://lms-api.mindx.edu.vn/', { headers })
}

module.exports = { createClient }
