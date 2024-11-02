const mongoose = require('mongoose');
const app = require('./index');
const config = require('./config/config');
const roleSeeder = require('./handlers/roleSeeder');

mongoose
    .connect(config.db.url)
    .then(() => {
        console.log('DB connection successful');
        roleSeeder();
    })
    .catch(err => {
        console.error('DB connection error:', err);
    });

const server = app.listen(config.port, () => {
    console.log(`App running on port ${config.port}...`);
});