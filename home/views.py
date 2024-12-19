
from django.shortcuts import render

# Create your views here.
from rest_framework import serializers
from django.http import HttpResponse
from django.template import Template
from django.template import Context
from django.template import loader
from .models import Question, Packs
from django.views import generic


def index(request):
    latest_question_list = Question.objects.order_by("pub_date")[:2]
    num_questions=Question.objects.all().count()
    num_packs=Packs.objects.all().count()
    template = loader.get_template('index.html')
    context = {"latest_question_list" : latest_question_list, "num_questions" : num_questions, "num_packs" : num_packs, }
    #return HttpResponse(template.render(context, request))
    return render(request, 'index.html', context)
'''
def detail(request, question_id):
    try:
        question = Question.objects.get(pk=question_id)
    except Question.DoesNotExist:
        raise Http404("Никаких вопросов нет.")

    response = "Вопрос: \n %s"

    return render(request, "home/index.html", {"question": question } )

def vote(request, question_id):
    return HttpResponse("Варианты ответов: %s" % question_id)

def results(request, question_id):
    return HttpResponse("YAY AYAYA AY", question_id)
'''

class QuestionListView(generic.ListView):
    model = Question
    
    def get_context_data(self, **kwargs):
        context = super(QuestionListView, self).get_context_data(**kwargs)
        context['some_data'] = 'This is just some data'
        return context

class QuestionDetailView(generic.DetailView):
    model = Question
