from django.db import models
from django.contrib.auth.models import User
from user.models import Appointment

class ChatRoom(models.Model):
    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE, related_name="chatroom")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="chatrooms")
    advisor = models.ForeignKey(User, on_delete=models.CASCADE, related_name="advisor_chatrooms")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"ChatRoom for {self.appointment}"

class Message(models.Model):
    chatroom = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"Message from {self.sender.username}"
