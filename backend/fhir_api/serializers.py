from rest_framework import serializers
from .models import Patient, Observation

class PatientFHIRSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = ['id', 'identifier', 'family_name', 'given_name', 'gender', 'birth_date']
        # On rend les champs optionnels au niveau du validateur standard 
        # car on va les remplir nous-mêmes dans to_internal_value
        extra_kwargs = {
            'family_name': {'required': False},
            'given_name': {'required': False},
            'birth_date': {'required': False},
        }

    def to_representation(self, instance):
        return {
            "resourceType": "Patient",
            "id": str(instance.id),
            "identifier": str(instance.identifier),
            "name": [{"family": instance.family_name, "given": [instance.given_name]}],
            "gender": instance.gender,
            "birthDate": instance.birth_date.isoformat() if instance.birth_date else None,
        }

    def to_internal_value(self, data):
        # Initialisation du dictionnaire interne
        internal_data = {}
        
        # Mapping FHIR -> Django
        if 'name' in data and isinstance(data['name'], list) and len(data['name']) > 0:
            name_info = data['name'][0]
            internal_data['family_name'] = name_info.get('family')
            if 'given' in name_info and isinstance(name_info['given'], list):
                internal_data['given_name'] = name_info['given'][0]
        
        if 'gender' in data:
            internal_data['gender'] = data['gender']
        
        if 'birthDate' in data:
            internal_data['birth_date'] = data['birthDate']
        elif 'birth_date' in data:
            internal_data['birth_date'] = data['birth_date']

        # Validation finale
        return super().to_internal_value(internal_data)

class ObservationFHIRSerializer(serializers.ModelSerializer):
    class Meta:
        model = Observation
        fields = '__all__'

    def to_representation(self, instance):
        return {
            "resourceType": "Observation",
            "id": str(instance.id),
            "code": {"text": instance.observation_type},
            "subject": {"reference": f"Patient/{instance.patient.id}"},
            "valueQuantity": {"value": float(instance.value), "unit": instance.unit},
            "effectiveDateTime": instance.effective_date.isoformat()
        }
