from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view
from rest_framework.response import Response

from .models import Task
from .serializers import TaskSerializer


@api_view(["GET"])
def health(request):
    return Response({"status": "ok"})


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all().order_by("sort_order", "created_at")
    serializer_class = TaskSerializer

    @action(detail=False, methods=["post"])
    def reorder(self, request):
        task_orders = request.data.get("task_orders", [])
        for item in task_orders:
            task_id = item.get("id")
            sort_order = item.get("sort_order")
            if task_id is not None and sort_order is not None:
                Task.objects.filter(id=task_id).update(sort_order=sort_order)
        return Response({"status": "success"}, status=status.HTTP_200_OK)
