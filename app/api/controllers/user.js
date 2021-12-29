
module.exports = {
    getUser: async (req, res, next) => {
        try {
            const user = [
                {
                    id: 1,
                    Name: "Emma smith"
                }
            ]

            res.status(200).send({success: true, user: user})
        } catch (e){
            next(e);
        }
    }
}