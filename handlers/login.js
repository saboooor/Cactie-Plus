const { readFileSync } = require('fs');
const YAML = require('yaml');
const { con } = YAML.parse(readFileSync('./config.yml', 'utf8'));

module.exports = client => {
	client.login(con.token);
	logger.info('Bot logged in');
};