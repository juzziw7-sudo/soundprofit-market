// Vercel Serverless Function Entry Point
const app = require('../backend_api/index');

module.exports = (req, res) => {
    // Vercel serverless adapter
    app(req, res);
};
