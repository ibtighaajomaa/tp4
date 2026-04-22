from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'patients', views.PatientViewSet, basename='patient')
router.register(r'observations', views.ObservationViewSet, basename='observation')

urlpatterns = [
    path('', include(router.urls)), # On enlève le "api/" ici car il est déjà dans le fichier principal
]
