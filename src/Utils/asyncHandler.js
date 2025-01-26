// const asyncHandler =  (reuestHandler) = return async(req,res,next)=>{
//     try {
//         reuestHandler(req,res,next)
//     } catch (error) {
//         res.status(error.code||400).json({
//             success : false,
//             message : error.messsage
//         })
//     }
// }
// const asyncHandler =  (reuestHandler) =>
// {return (req,res,next) =>{
//     Promise.resolve(
//         reuestHandler(req,res,next)
//     ).catch((err)=> next(err))}
// }

const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) =>
            next(err)
        )
    }
}

export { asyncHandler }

// const asyncHandler = (fn) => {
//     return (req, res, next) => {
//       fn(req, res, next).catch((err) => {
//         next(err);
//       });
//     };
//   };

// export { asyncHandler };
