import sqlalchemy 
from sqlalchemy import text

engine = sqlalchemy.create_engine(
    "mariadb+mariadbconnector://"+
    "")

# sql = text('SELECT * from `test`.`wiki` LIMIT :a')
# result = engine.execute(sql, {'a': 10})

# names = tuple(row for row in result)
# print(names)

def ranking_list(page:int = 0, number:int = 30):
    sql = text("""SELECT A.`rank`, B.`name`, "artist", "singer", B.`release`, B.url
	FROM `jadal_ranking`.`info` AS `A`
    INNER JOIN `jadal_ranking`.`song` AS `B` ON A.id_song = B.id
WHERE A.`id_date_rank`=(
	SELECT `id`
	from `jadal_ranking`.`date_rank` 
	order BY `date` DESC
	LIMIT 1)
ORDER BY `rank` ASC
LIMIT 
    :a, :b;""")
    result = engine.execute(sql, {'a': page, 'b': number})
    names = tuple(dict(row) for row in result)
    return names


def wiki_list(page:int = 0, number:int = 30):
    sql = text("""SELECT 
    `key`, `site_id` AS `site` , `title_t`AS`title`, "artist", "singer", "release"
FROM 
    `test`.`wiki` LIMIT :a, :b; """)
    result = engine.execute(sql, {'a': page, 'b': number})
    names = tuple(dict(row) for row in result)
    return names

def wiki_content(key:int):
    sql = text('SELECT `contents`AS`content`, `site_id`AS`url` FROM `test`.`wiki` WHERE `key`=:a')
    result = engine.execute(sql, {'a': key})
    names = tuple(dict(row) for row in result)
    return names[0]


def auth_email_is_exist(email:str):
    sql = text('SELECT `email` FROM `jadal_user`.`user` WHERE `email`=:a;')
    result = engine.execute(sql, {'a': email})
    names = tuple(dict(row) for row in result)
    return len(names) > 0

def auth_name_is_exist(name):
    sql = text('SELECT `email` FROM `jadal_user`.`user` WHERE `name`=:a;')
    result = engine.execute(sql, {'a': name})
    names = tuple(dict(row) for row in result)
    return len(names) > 0

def auth_id_is_exist(id):
    sql = text('SELECT `email` FROM `jadal_user`.`user` WHERE `id`=:a;')
    result = engine.execute(sql, {'a': id})
    names = tuple(dict(row) for row in result)
    return len(names) > 0

def auth_id_is_registed(key):
    sql = text('SELECT `email` FROM `jadal_user`.`user` WHERE `key`=:a;')
    result = engine.execute(sql, {'a': key})
    names = tuple(dict(row) for row in result)
    return len(names) > 0

def auth_user_regist(email, id, pwd, name):
    SQL = (
        "INSERT INTO " +
            "`jadal_user`.`user` (`name`, `password`, `email`, `id`) " + 
        "VALUES (?, ?, ?, ?); ")
    try:
        engine.execute( SQL, (name, pwd, email, id)) 
        return True
    except:
        return False

def login_as_email(email, pwd) -> int:
    sql = text('SELECT `key` FROM `jadal_user`.`user` WHERE `email`=:a AND `password`=:b;')
    try:
        a = engine.execute( sql, {"a":email, "b":pwd}) 
        return [*a][0][0]
    except:
        return False

def login_as_id(id, pwd) -> int:
    sql = text('SELECT `key` FROM `jadal_user`.`user` WHERE `id`=:a AND `password`=:b;')
    try:
        a = engine.execute( sql, {"a":id, "b":pwd}) 
        return [*a][0][0]
    except:
        return False

a = auth_id_is_registed("58")
print(a)