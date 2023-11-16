module.exports = (thFun) => (req, res, next) => {

    Promise.resolve(thFun(req, res, next)).catch(next)
}