# check compatibility
import py4web
import sys

assert py4web.check_compatible("1.20190709.1")

# by importing controllers you expose the actions defined in it
if not any(x in sys.argv[0] for x in ["cleanup_themealdb.py", "some_other_script.py"]):
    from . import controllers
# by importing db you expose it to the _dashboard/dbadmin
from .models import db

# optional parameters
__version__ = "0.0.0"
__author__ = "you <you@example.com>"
__license__ = "anything you want"
