from django.db import models
import uuid

class Patient(models.Model):
    identifier = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    family_name = models.CharField(max_length=100)
    given_name = models.CharField(max_length=100)
    gender = models.CharField(max_length=10, choices=[('male','Male'),('female','Female'),('other','Other')])
    birth_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.family_name} {self.given_name}"

class Observation(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='observations')
    observation_type = models.CharField(max_length=50)
    value = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=20)
    effective_date = models.DateTimeField()
