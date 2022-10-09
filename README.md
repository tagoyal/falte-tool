# falte-tool

This repo outlines how to build a Flask application to collect fine-grained error annotations for long text. 

### Steps
Clone this repo. Then create a virtual environment for your application. This should be in the root folder of this repo. 
```
python3 -m venv venv
source venv/bin/activate
```

Install dependencies 
```
python -m pip install -r requirements.txt
```

Customize the error_dictionary variable in statis/js/annotation.js file to reflect your error taxonomy. Refer to the paper for definitions of 'singleton' and 'paired' errors.

Set up a postgres server locally. Update the location of the database in app.py

Run locally
```
flask run
```



In our data collection, we used heroku to host this application. Refer to this repo for instructions for heroku: http://blog.sahildiwan.com/posts/flask-and-postgresql-app-deployed-on-heroku/

Alternatively, you can use any other platform to host this demo and collect data. 
