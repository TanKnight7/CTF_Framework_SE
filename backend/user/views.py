from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view

### ==== Models & Serializers
from knox.models import AuthToken
from .models import User
from .serializers import UserRegistrationSerializer, UserListSerializer, UserDetailSerializer, UserUpdateSerializer

### ==== Authentication & Authorization
from rest_framework.decorators import authentication_classes, permission_classes
from knox.auth import TokenAuthentication
from rest_framework.permissions import IsAuthenticated


@api_view(['POST'])
def login(request):
    if request.data.get('username') == None or request.data.get('password') == None:
        return Response({"error":"Please provide username and password."}, status=status.HTTP_400_BAD_REQUEST)
    
    user = User.objects.filter(username=request.data.get('username')).first()
    if user == None or not user.check_password(request.data.get('password')):
        return Response({"error":"Username not found or password is invalid."}, status=status.HTTP_404_NOT_FOUND)
    
    # Deleting all existing tokens..
    AuthToken.objects.filter(user=user).delete()
    token_instance, token = AuthToken.objects.create(user)
    
    return Response({"token": token}, status=status.HTTP_200_OK)

@api_view(['POST'])
def register(request):
    serializer = UserRegistrationSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    
    user = serializer.save()
    
    return Response({"message": "User successfully registered.", "user": UserRegistrationSerializer(user).data}, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_all_users(request):
    users = User.objects.all()
    serializer = UserListSerializer(users, many=True)
    return Response(serializer.data)

@api_view(['GET', 'PUT', 'DELETE'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_update_delete_user(request, pk):
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = UserDetailSerializer(user, context={'request':request})
        return Response(serializer.data)
    
    if user != request.user and request.user.role != 'admin':
        return Response({"error": "You do not have permission to modify or delete this user's profile."}, 
                        status=status.HTTP_403_FORBIDDEN)
    
    if request.method == 'PUT':
        old_password = request.data.get('old_password', None)
        new_password = request.data.get('password', None)
        
        if new_password:
            if not old_password:
                return Response({"error": "Old password is required to set a new password."},
                            status=status.HTTP_400_BAD_REQUEST)
            if not user.check_password(old_password):
                return Response({"error": "Old password is incorrect."},
                            status=status.HTTP_400_BAD_REQUEST)
        
        
        serializer = UserUpdateSerializer(user, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer.save()
        return Response({"success": "Profile updated.", "data": UserDetailSerializer(user, context={'request':request}).data}, status=status.HTTP_200_OK)

    if request.method == 'DELETE':
        user.delete()
        return Response({"success": "User deleted."},status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def me(request):
    return Response(UserDetailSerializer(request.user, context={'request':request}).data, status=status.HTTP_200_OK)
