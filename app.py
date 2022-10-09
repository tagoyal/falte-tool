from flask import Flask, render_template, request, Markup, redirect
import json
import random
import string

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://localhost/annotation_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

from flask_sqlalchemy import SQLAlchemy
db = SQLAlchemy(app)

input_data = json.load(open('./stories.json'))



class annotation(db.Model):
	__tablename__ = 'annotation_v2'
	sampleid = db.Column(db.Integer, primary_key=True, autoincrement=True)
	segmentid = db.Column(db.Integer, nullable=False)
	storyid = db.Column(db.String(100), nullable=False)
	error = db.Column(db.String(100), nullable=False)
	span1 = db.Column(db.String(500))
	span1_start = db.Column(db.Integer)
	span1_end = db.Column(db.Integer)
	span2 = db.Column(db.String(500))
	span2_start = db.Column(db.Integer)
	span2_end = db.Column(db.Integer)
	survey_code = db.Column(db.String(100), nullable=False)
	feedback = db.Column(db.String(500))
	annotator = db.Column(db.String(100))

	def __init__(self, storyid, segmentid, error, survey_code, feedback=None, annotator=None,
				span1=None, span1_start=None, span1_end=None, 
				span2=None, span2_start=None, span2_end=None):
		self.storyid = storyid
		self.segmentid = segmentid
		self.error = error
		self.span1 = span1
		self.span1_start = span1_start
		self.span1_end = span1_end
		self.span2 = span2
		self.span2_start = span2_start
		self.span2_end = span2_end
		self.survey_code = survey_code
		self.feedback = feedback
		self.annotator = annotator


@app.route("/id=<uniqueid>")
def start(uniqueid):
	story_id = uniqueid
	sentence_id = 0

	all_sentences = input_data[story_id]["sentences"]
	context_sentence = [Markup(all_sentences[s]) for s in range(sentence_id)]
	context = context_sentence
	next_sentence = Markup(input_data[story_id]["sentences"][sentence_id])


	context_html = render_template('context.html', context=context_sentence, next_sentence=next_sentence)

	return render_template('index.html', story_id=story_id, sentence_id=1, total_sentence_ids=len(all_sentences),  context_html=Markup(context_html))



@app.route('/next')
def nextbutton():
	story_id = request.args.get('story_id')
	sentence_id = int(request.args.get('sentence_id'))

	all_sentences = input_data[story_id]["sentences"]
	context_sentence = [Markup(all_sentences[s]) for s in range(sentence_id)]
	context = context_sentence
	next_sentence = Markup(input_data[story_id]["sentences"][sentence_id])
	return render_template('context.html', context=context_sentence, next_sentence=next_sentence)



def parse_annotation_actions(annotation_actions):
	actions = annotation_actions.split(' <END> ')
	actions = [action for action in actions if action != '']

	story_id = actions[0]
	actions.pop(0)

	print(actions)
	final_annotations = []
	for action in actions:
		if action.startswith('<ADD>'):
			action = action[5:].strip()
			d = json.loads(action)
			entry = {
				'storyid': story_id,
				'segmentid': d['segmentId'],
				'error': d['error'],
				'span1': d['span_1']['text'][:500], 
				'span1_start': d['span_1']['start'],
				'span1_end': d['span_1']['end'],
				'span2': d['span_2']['text'][:500],
				'span2_start': d['span_2']['start'],
				'span2_end': d['span_2']['end'],
				'feedback': d['feedback']
			}
			final_annotations.append(entry)
		elif action.startswith('<DEL>'):
			action = action[5:].strip()
			del_idx = int(action)
			final_annotations.pop(del_idx)

	return story_id, final_annotations


@app.route('/feedback/<survey_code>')
def feedback(survey_code):
    return render_template('feedback.html', survey_code=survey_code)


@app.route('/submitform', methods = ['POST', 'GET'])
def submitform():
	if request.method == 'POST':
		survey_code = ''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(10))
		
		all_annotation_actions = request.form['all-annotations']
		print(all_annotation_actions)
		# annotator = request.form['annotator'] //only applicable when using internally
		annotator = 'turker'
		story_id, db_data = parse_annotation_actions(all_annotation_actions)
		try:
			if len(db_data) > 0:
				for d in db_data:
					d['survey_code'] = survey_code
					d['annotator'] = annotator
					entry = annotation(**d)
					db.session.add(entry)
					db.session.commit()
			else:
				entry = annotation(storyid=story_id, segmentid=0, error='no-error', survey_code=survey_code, annotator=annotator)
				db.session.add(entry)
				db.session.commit()
			msg = "Records successfully added"
		except Exception as e:
			msg = e
		finally:
			print(msg)
			return redirect(f"feedback/{survey_code}")


			

