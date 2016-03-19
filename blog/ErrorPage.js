module.exports = function (response, message) {
    response.writeHead(404, {'Content-Type': 'text/plain'});
    response.end(message);
};