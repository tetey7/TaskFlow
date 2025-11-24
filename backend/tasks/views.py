from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import viewsets
from .models import Task
from .serializers import TaskSerializer


@api_view(["GET"])
def health(request):
    return Response({"status": "ok"})


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer