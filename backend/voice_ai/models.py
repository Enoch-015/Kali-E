from django.db import models
import uuid

class Session(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    room_name = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Session {self.room_name}"

class Transcript(models.Model):
    session = models.ForeignKey(Session, related_name='transcripts', on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
    user_message = models.TextField(blank=True, null=True)
    assistant_message = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Transcript at {self.timestamp}"