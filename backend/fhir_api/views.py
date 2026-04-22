from rest_framework import viewsets
from .models import Patient, Observation
from .serializers import PatientFHIRSerializer, ObservationFHIRSerializer
from rest_framework.permissions import IsAuthenticated

class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientFHIRSerializer
    permission_classes = [IsAuthenticated]

class ObservationViewSet(viewsets.ModelViewSet):
    queryset = Observation.objects.all()
    serializer_class = ObservationFHIRSerializer
    permission_classes = [IsAuthenticated]
