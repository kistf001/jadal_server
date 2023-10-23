import mariadb
from app import info_private

conn = None
cur = None

# 메인코드

# Connect to MariaDB Platform
try:
    conn = mariadb.connect(
        db=info_private.db,
        host=info_private.host, 
        user=info_private.user, 
        password=info_private.password)
        
except mariadb.Error as e:
    print(f"Error connecting to MariaDB Platform: {e}")

cur = conn.cursor() 
# conn.autocommit = True

######################################################
#
######################################################
def rank_list_long(page:int):
    SQL = """SELECT A.`rank`, B.`name`, B.`release`, B.url
	FROM `jadal_ranking`.`info` AS `A`
    INNER JOIN `jadal_ranking`.`song` AS `B` ON A.id_song = B.id
WHERE A.`id_date_rank`=(
	SELECT `id`
	from `jadal_ranking`.`date_rank` 
	order BY `date` DESC
	LIMIT 1)
ORDER BY `rank` ASC
LIMIT ?, 30;"""
    try:
        cur.execute(SQL,(page,))
    except Exception as e:
        print(e)
    return [{ 
        "rank":a[0], "title":a[1], "release":a[2], "url":a[3]
        } for a in [*cur]]

def rank_list_short():
    SQL = """SELECT A.`rank`, B.`name`, B.`release`, B.url
	FROM `jadal_ranking`.`info` AS `A`
    INNER JOIN `jadal_ranking`.`song` AS `B` ON A.id_song = B.id
WHERE A.`id_date_rank` = (
	SELECT `id`
	from `jadal_ranking`.`date_rank` 
	order BY `date` DESC
	LIMIT 1)
ORDER BY `rank` ASC
LIMIT 10;"""
    try:
        cur.execute(SQL)
    except Exception as e:
        print(e)
    return [{ 
        "rank":a[0], "title":a[1], "release":a[2], "url":a[3]
        } for a in [*cur]]

######################################################
#
######################################################
def auth_login_use_email(passwd, email):
    SQL =  "SELECT * FROM `jadal_user`.`user` WHERE `email`=? AND `password`=?; "
    try:
        cur.execute(SQL, (email, passwd))
    except Exception as e:
        print(e)
    return len([*cur]) > 0

def auth_login_use_id(passwd, id):
    SQL =  "SELECT * FROM `jadal_user`.`user` WHERE `id`=? AND `password`=?; "
    try:
        cur.execute(SQL, (id, passwd))
    except Exception as e:
        print(e)
    return len([*cur]) > 0

######################################################
#
######################################################
def auth_cheack_name_is_exist(name):
    try:
        cur.execute( "SELECT * FROM `jadal_user`.`user` WHERE `name`=?; ",(name,)) 
    except Exception as e:
        print(e)
    return len([*cur]) > 0
def auth_cheack_id_is_exist(id):
    try:
        cur.execute( "SELECT * FROM `jadal_user`.`user` WHERE `id`=?; ",(id,)) 
    except Exception as e:
        print(e)
    return len([*cur]) > 0
def auth_cheack_user_is_exist(email):
    try:
        cur.execute( "SELECT * FROM `jadal_user`.`user` WHERE `email`=?; ",(email,)) 
    except Exception as e:
        print(e)
    return len([*cur]) > 0
def auth_cheack_user_is_registered(email):
    try:
        cur.execute( "SELECT * FROM `jadal_user`.`user` WHERE `email`=?; ",(email,)) 
    except Exception as e:
        print(e)
    return { "result":len([*cur]) > 0, "status":200 }
    
######################################################
#
######################################################
def auth_insert_user(name, pwd, email, id):
    SQL = (
        "INSERT INTO " +
            "`jadal_user`.`user` (`name`, `password`, `email`, `id`) " + 
        "VALUES (?, ?, ?, ?); ")
    try:
        cur.execute( SQL, (name, pwd, email, id)) 
    except Exception as e:
        return False
    return True

######################################################
#
######################################################
def jadal_get_wiki_list_long(page=1):
    if page is page<1: page = 1
    cur.execute(
        "SELECT `key`, `site_id`, `title_t` FROM `wiki` LIMIT ?, ? ", 
        ((page - 1) * 40, 40) )
    buffer = [*cur]
    return buffer
def jadal_get_wiki_content(key=1):
    if key is key<1: key = 1
    cur.execute( "SELECT `contents`, `site_id` FROM wiki WHERE `key`=?",(key,) )
    buffer = []
    for _ in cur:
        buffer.append([_[0], _[1]])
    return buffer
# print(jadal_get_wiki_list_long(page=1))

# cur = conn.cursor()
# auth_insert_user("c","c","c")

# def auth_get_user_info():
#     cur.execute( "SELECT `key`, `site_id`, `title_t` FROM `wiki` LIMIT ?, ? ",(40,40) )

# def auth_insert_user(name, password, email):
#     SQL = "INSERT INTO `jadal_user`.`user` (`name`, `password`, `email`) VALUES (?, ?, ?);"
#     cur.execute(SQL, (name, password, email))



# #insert information 
# try: 
#     cur.execute("INSERT INTO employees (first_name,last_name) VALUES (?, ?)", ("Maria","DB")) 
# except mariadb.Error as e: 
#     print(f"Error: {e}")

# conn.commit() 
# print(f"Last Inserted ID: {cur.lastrowid}")
    
# conn.close()


# auth_insert_user("name", "password", "email")