# A simple website for chgk game

## Installing
* install python and npm
* *(optional)* make a virtual enviroment
* run `pip install -r requirements.txt`
* run `npm install` from `./front_end/`

## Running
### back-end
* `python manage.py migrate` *(if needed)*
* `python manage.py runserver`

### front-end
* run `npm run-script start` from `./front_end/`

## Filling DB with generated .json
* *(optional)* run selenium_parser.py
* run `python manage.py loaddata questions.json`
