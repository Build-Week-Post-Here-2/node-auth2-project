const db = require('../../data/dbConfig')

module.exports = {
    add(user) {
        return db('users')
                .insert(user)
                .then(([id]) => {
                    return db('users')
                            .where('id', id)
                })
    },
    findBy(filter) {
        return db("users")
          .where(filter);
    },
    getAll() {
        return db('users')
    }
}