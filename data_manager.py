import os
import psycopg2
import psycopg2.extras


def establish_connection():
    try:
        conn = psycopg2.connect(os.environ.get("DATABASE_URL"))
        conn.autocommit = True
    except psycopg2.DatabaseError as e:
        print("Cannot connect to database.")
        print(e)
    else:
        return conn


def get_connection_data(db_name=None):
    """
    Give back a properly formatted dictionary based on the environment variables values which are started
    with :MY__PSQL_: prefix
    :db_name: optional parameter. By default it uses the environment variable value.
    """
    if db_name is None:
        db_name = os.environ.get("MY_PSQL_DBNAME")

    return {
        "dbname": os.environ.get("MY_PSQL_DBNAME"),
        "user": os.environ.get("MY_PSQL_USER"),
        "host": os.environ.get("MY_PSQL_HOST"),
        "password": os.environ.get("MY_PSQL_PASSWORD"),
    }


def execute_select(statement, variables=None, fetchall=True):
    """
    Execute SELECT statement optionally parameterized.
    Use fetchall=False to get back one value (fetchone)

    Example:
    > execute_select('SELECT %(title)s; FROM shows', variables={'title': 'Codecool'})
    statement: SELECT statement
    variables:  optional parameter dict, optional parameter fetchall"""
    result_set = []
    with establish_connection() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            cursor.execute(statement, variables)
            result_set = cursor.fetchall() if fetchall else cursor.fetchone()
    return result_set


def execute_dml_statement(statement, variables=None):
    """
    Execute data manipulation query statement (optionally parameterized)

    :statment: SQL statement

    :variables:  optional parameter dict"""
    result = None
    with establish_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(statement, variables)
            try:
                result = cursor.fetchone()
            except psycopg2.ProgrammingError as pe:
                pass
    return result
