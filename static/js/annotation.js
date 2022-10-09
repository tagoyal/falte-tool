var error_dictionary = {
    'selection-character': {'name': 'New Person not Introduced', 'type': 'singleton'},
    'selection-event': {'name': 'Missing Information about Object/Event', 'type': 'singleton'},
    'selection-scene': {'name': 'Abrupt Scene Transition', 'type': 'singleton'},
    'selection-repitition': {'name': 'Repitition', 'type': 'paired'},
    'selection-inconsistent': {'name': 'Inconsistent', 'type': 'paired'},
    'selection-grammar': {'name': 'Ungrammatical', 'type': 'singleton'},
    'selection-coref': {'name': 'Unclear Coreference', 'type': 'singleton'}
}



var uncheckboxes = function(classname){
  var elements = document.getElementsByClassName(classname);
  for (var i = 0; i < elements.length; i++) {
        elements[i].style.backgroundColor = "#DEDEDE";
  }
  $SPAN2_START = 0;
  $SPAN2_END = 0;
}


var enableElement = function(elementId){
  var elem = document.getElementById(elementId);
  $(elem).removeAttr('disabled');
}


var disableElement = function(elementId){
  var elem = document.getElementById(elementId);
  elem.setAttribute('disabled', 'true');
}


var unhideClass = function(classname){
  var elements = document.getElementsByClassName(classname);
  for (var i = 0; i < elements.length; i++) {
        elements[i].hidden = false;
  }
}


var hideClass = function(classname){
  var elements = document.getElementsByClassName(classname);
  for (var i = 0; i < elements.length; i++) {
        elements[i].hidden = true;
  }
}


var hideDisplay = function(classname){
  var elements = document.getElementsByClassName(classname);
  for (var i = 0; i < elements.length; i++) {
        elements[i].style.setProperty('display', 'none');
  }
}

function resetInputField(inputid){
  var input = document.getElementById(inputid)
  $(input).val('')
}


var resetAllSteps = function(){
  resetInputField('highlight-span-1');
  resetInputField('highlight-span-2');
  resetInputField('feedback-span');
  hideClass('step2');
  hideClass('step3');
  hideClass('step4');

  $SELECTED_CHECKBOX = ''
  $SPAN1_START = 0;
  $SPAN1_END = 0;
  $SPAN2_START = 0;
  $SPAN2_END = 0;
  $POPULATE = 1;
}


function showTutorialAnswers() {
  var elem = document.getElementById('example-solution');
  elem.style.setProperty('display', 'block');
}


function update_context_and_sentence(sentence_id){
  story_id = document.getElementById("story-id").innerHTML;
  total_sents = parseInt(document.getElementById('total-sentence-ids').innerHTML);

  if (sentence_id >= total_sents){
    enableElement('submit-button')
  }
  else {
    $.ajax({
        url: "/next",
        type: "get",
        data: {story_id: story_id,
              sentence_id: sentence_id},
        success: function(response) {
          $("#context_and_sentence").html(response);
          document.getElementById("next-sentence-id").innerHTML = parseInt(sentence_id) + 1;
        },
        error: function(xhr) {
          enableElement('submit-button')
          console.log('Error')
        }
      });
  }
}



$(document).on('click', '#next-button', function(){
  sentence_id = document.getElementById("next-sentence-id").innerHTML;
  update_context_and_sentence(sentence_id);
  uncheckboxes('checkbox-selection-box');
  resetAllSteps();
  disableElement('add-button');

  var formelem = document.getElementById('all-annotations');
  if (formelem.value == ''){
    formelem.value = document.getElementById('story-id').innerHTML + ' <END> ';
  }

});


$(document).on('click', '#previous-button', function(){
  sentence_id = parseInt(document.getElementById("next-sentence-id").innerHTML) - 2;
  if (sentence_id >= 0){
    update_context_and_sentence(sentence_id);
  }
  uncheckboxes('checkbox-selection-box');
  resetAllSteps();
  disableElement('add-button');
});


function nexttutorialstep(nextstep){
  document.getElementById('tutorial-box-step' + (nextstep - 1)).style.setProperty('display', 'none');
  document.getElementById('tutorial-box-step' + nextstep).style.setProperty('display', 'block');
}

function prevtutorialstep(prevstep){
  document.getElementById('tutorial-box-step' + (prevstep + 1)).style.setProperty('display', 'none');
  document.getElementById('tutorial-box-step' + prevstep).style.setProperty('display', 'block');
}

function insertTableHeader(tab){
  var arrHead = new Array();  // array for header.
  arrHead = ['', 'SegmentId', 'Error Type', 'Span'];
  var tr = tab.insertRow(-1);
    for (var h = 0; h < arrHead.length; h++) {
        var th = document.createElement('th'); // create table headers
        th.innerHTML = arrHead[h];
        tr.appendChild(th);
  }
}




function boldRelevantSpan(context, span_start, span_end){
  console.log(context);
  console.log(span_start);
  console.log(span_end);
  if (span_start == 0 && span_end == 0){
    return '';
  }
  var prefix = context.substring(span_start - 30, span_start);
  if (!prefix == ''){
    prefix = '...' + prefix;
  }
  var span = ' <b>' + context.substring(span_start, span_end) + '</b> ';
  var suffix = context.substring(span_end, span_end + 30);
  if (!suffix == ''){
    suffix += '...';
  }
  return prefix + span + suffix;
}


function addRow() {
  var tab = document.getElementById('annotations-table');

  var rowCnt = tab.rows.length;   // table row count.

  var formelem = document.getElementById('all-annotations');

  if (rowCnt == 0){
    formelem.value = document.getElementById('story-id').innerHTML + ' <END> ';
  }

  var tr = tab.insertRow(0); // the table row.

  var td0 = tr.insertCell(0);  // column 0
  var button = document.createElement('button');
  button.innerHTML = 'Remove'
  button.setAttribute('onclick', 'removeRow(this)');
  td0.appendChild(button);
    
  
  var segId = parseInt(document.getElementById("next-sentence-id").innerHTML) - 1;
  var nextsentence = document.getElementById('next-sentence-box').textContent;
  var context = document.getElementById('context-box').value;

  var span1_bold = boldRelevantSpan(nextsentence, $SPAN1_START, $SPAN1_END);
  //var span2_bold = boldRelevantSpan(nextsentence, $SPAN2_START, $SPAN2_END);
  console.log(span1_bold);

  var error = error_dictionary[$SELECTED_CHECKBOX]['name'];

  var td1 = tr.insertCell(1);  // column 1
  let td_text = `${error} -- Spans: ${span1_bold}, Segment: ${segId}`;
  td1.innerHTML = td_text;


  let formelemvalue = {'segmentId': segId,
                      'error': $SELECTED_CHECKBOX,
                      'span_1': {'start': $SPAN1_START, 'end': $SPAN1_END, 'text': document.getElementById('highlight-span-1').value},
                      'span_2': {'start': $SPAN2_START, 'end': $SPAN2_END, 'text': document.getElementById('highlight-span-2').value},
                      'feedback': document.getElementById('feedback-span').value
                      }

  var formelemvalue_json = JSON.stringify(formelemvalue);
  // update all-annotations input with row data
  formelem.value = formelem.value + '<ADD> ' + formelemvalue_json + ' <END> ';
}

function removeRow(oButton) {
  var tab = document.getElementById('annotations-table');
  var rowIndex = oButton.parentNode.parentNode.rowIndex
  tab.deleteRow(rowIndex); // button -> td -> tr.

  var rowCnt = tab.rows.length;
  var formelem = document.getElementById('all-annotations');
  formelem.value = formelem.value + '<DEL> ' + (rowCnt - rowIndex).toString() + ' <END> ';
}


function showErrorDescription(errortype) {
  var elem = document.getElementById(errortype);
  hideDisplay('error-type-definition');
  elem.style.setProperty('display', 'block');
}


$(document).on('click', '#add-button', function() {
  addRow();
  uncheckboxes('checkbox-selection-box');
  resetAllSteps();
  disableElement('add-button');
});


function addHighlightToInput(parentId, spanId){
  var selection = window.getSelection();
  var start = selection.anchorOffset;
  var end = selection.extentOffset;
  var anchorNode = selection.anchorNode;
  var extentNode = selection.extentNode;
  var parent = document.getElementById(parentId);

  if (!parent.contains(anchorNode)) return;

  var startIndex = calculateOffset(anchorNode, parent, start);
  var endIndex = calculateOffset(extentNode, parent, end);

  nextsentence = parent.textContent;
  var selected_string = nextsentence.substring(startIndex, endIndex);
  if (!selected_string == ''){
    var elem = document.getElementById(spanId);
    elem.value = selected_string;
    if (parentId == 'next-sentence-box'){
      $SPAN1_START = startIndex;
      $SPAN1_END = endIndex;
    } else {
      $SPAN2_START = startIndex;
      $SPAN2_END = endIndex;
    }
    return true;
  } else {
    return false;
  }
}

function calculateOffset(child, parent, relativeOffset) {
  var children = [];
  // add the child's preceding siblings to an array
  for (var c of parent.childNodes) {
    if (c === child || c == child.parentNode) break;
    children.push(c);
  }
  // calculate the total text length of all the preceding siblings and increment with the relative offset
  return relativeOffset + children.reduce((a, c) => a + c.textContent.length, 0);
}


$(document).on('focus', '#highlight-span-1', function(){
  $POPULATE = 1;
});

$(document).on('focus', '#highlight-span-2', function(){
  $POPULATE = 2;
});


$(document).on('mouseup', '#context-content-box', function(){
  if($("#add-button").is(":disabled")){
    return;
  } else {
    var success = addHighlightToInput('context-box', 'highlight-span-2');  
    if (success){
      unhideClass('step4');
    }
  }
});


$(document).on('mouseup', '#next-sentence-content-box', function(){
    if ($POPULATE == 1){
      var success = addHighlightToInput('next-sentence-box', 'highlight-span-1');
      if (success){
        unhideClass('step2');
      }
    }
    else {
      var success = addHighlightToInput('next-sentence-box', 'highlight-span-2');
      if (success){
        unhideClass('step4');
      }
    }
});


//actions to take on selecting one of the error types
$(document).on('click', '.checkbox-selection-box', function() {
  var elemId = $(this).attr("id");
  var elem = document.getElementById(elemId);
  selected_string = ''
   
  uncheckboxes('checkbox-selection-box'); // change background of all other check-boxes
  elem.style.backgroundColor = "#bcf5bc"; // change background color of selected box

  enableElement('add-button');

  $SELECTED_CHECKBOX = elemId;

  if (error_dictionary[$SELECTED_CHECKBOX]['type'] == 'paired'){
    hideClass('step4')
    unhideClass('step3');
    $POPULATE = 2;
  }
  else {
    hideClass('step3')
    unhideClass('step4');
  }

});



//this and next function implements highlighting other instances of same NE when highlighting
$(document).on('mouseover', '.ne', function() {
  var prev_highlighted = document.getElementsByClassName('highlighted');
  while(prev_highlighted.length > 0){
    prev_highlighted[0].classList.remove('highlighted');
  }
  
  var classname = $(this).attr("class").split(/\s+/)[1];
  var elements = document.getElementsByClassName(classname);

  for (var i = 0; i < elements.length; i++) {
      elements[i].classList.add("highlighted");
    }
});

$(document).on('mouseout', '.highlighted', function() {
  var prev_highlighted = document.getElementsByClassName('highlighted');
  while(prev_highlighted.length > 0){
    prev_highlighted[0].classList.remove('highlighted');
  }
});



window.addEventListener("pageshow", () => {
  resetInputField('all-annotations');
  var tab = document.getElementById('annotations-table');
  tab.innerHTML = '';
  $POPULATE = 1;

  console.log('here');

  html = ''

  template = ' <a class="checkbox-selection-box" id="ERROR_ID">ERROR_NAME</a> \n';
  Object.keys(error_dictionary).forEach(function(key){
    html += template.replace('ERROR_ID', key).replace('ERROR_NAME', error_dictionary[key]['name']);
  });

  document.getElementById('error-types-buttons').innerHTML = html;
});

