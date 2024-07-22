exports.insertUserSql = `INSERT INTO 
                            users (company_number, salt, password, name, business_name, contact, address, sector_id, img) 
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`;

exports.selectUserSql = 'SELECT * FROM users WHERE company_number = ?;';