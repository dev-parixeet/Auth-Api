const RouteWorking = async(req,res)=>{
    res.status(200).json({
        status:"success",
        message:"Routing is working"
    })
}

module.exports = {RouteWorking}