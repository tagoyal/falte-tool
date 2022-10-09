import csv
import os
import json
import numpy as np
from allennlp.predictors.predictor import Predictor
predictor_ner = Predictor.from_path("https://storage.googleapis.com/allennlp-public-models/ner-elmo.2021-02-12.tar.gz")

final_data = {}
input_data = json.load(open('stories_init.json'))

all_sents = []
for key, data in input_data.items():
    sents = data['sentences']

    entities = set([])
    for sent in sents:
        res = predictor_ner.predict(sentence=sent)
        tags = res['tags']
        words = res['words']

        for t_idx, (t, w) in enumerate(zip(tags, words)):
            if t in ['B-PER', 'U-PER', 'L-PER']:
                entities.add(w)

    entity_dict = {}
    for ent_idx, ent in enumerate(entities):
        entity_dict[ent] = ent_idx

    final_sents = []
    for sent in all_sents:
        for ent in entity_dict:
            sent = sent.replace(f'{ent}', f'<span class = \'ne ne-{entity_dict[ent]}\'>{ent}</span>')
        final_sents.append(sent)

    final_data[key] = {"sentences": final_sents}

output_file = open('stories.json', 'w')
json.dump(final_data, output_file)