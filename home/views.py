from django.shortcuts import render

# Create your views here.
from django.http import HttpResponse


def index(request):
    return HttpResponse("Здравствуйте здесь скоро будет сайт ЧГК не расходитесь")
