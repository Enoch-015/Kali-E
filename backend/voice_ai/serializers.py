from rest_framework import serializers
from .models import Session, Transcript
class TranscriptSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transcript
        fields = ['id', 'timestamp', 'user_message', 'assistant_message']

class SessionSerializer(serializers.ModelSerializer):
    transcripts = TranscriptSerializer(many=True, read_only=True)

    class Meta:
        model = Session
        fields = ['id', 'room_name', 'created_at', 'is_active', 'transcripts', 'files']