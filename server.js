const app = require('./app')

const port = process.env.PORT || 4003;

app.listen(port, () => {
    console.log("server is listening to port " + port);
})