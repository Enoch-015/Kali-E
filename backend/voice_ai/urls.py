from django.urls import path
from . import views

urlpatterns = [
    path('health/', views.health_check, name='health_check'),
    path('sessions/', views.session_list, name='session_list'),
    path('sessions/<uuid:session_id>/', views.session_detail, name='session_detail'),
    path('sessions/<uuid:session_id>/start/', views.start_session, name='start_session'),
    path('sessions/<uuid:session_id>/end/', views.end_session, name='end_session'),
    path('sessions/<uuid:session_id>/message/', views.send_message, name='send_message'),
    path('sessions/<uuid:session_id>/token/', views.get_token, name='get_token'),
    path('get_token/', views.get_token, name='get_token'),
]