
from django.shortcuts import render

# Create your views here.
from django.http import HttpResponse
from django.template import loader
from .models import Question


def index(request):
    latest_question_list = Question.objects.order_by("pub_date")[:2]
    template = loader.get_template('home/index.html')
    context = {"latest_question_list" : latest_question_list,}
    return HttpResponse(template.render(context, request))

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