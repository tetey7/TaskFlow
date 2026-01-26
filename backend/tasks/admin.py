from django.contrib import admin

from tasks.models import Task


class TaskAdmin(admin.ModelAdmin):
    list_display = ("title", "priority", "due_date", "completed", "created_at")
    list_filter = ("priority", "completed", "created_at", "due_date")
    search_fields = ("title", "description")
    list_editable = ("completed",)
    readonly_fields = ("created_at",)
    date_hierarchy = "due_date"


admin.site.register(Task, TaskAdmin)
