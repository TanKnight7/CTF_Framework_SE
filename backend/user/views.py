from rest_framework import status
from rest_framework.response import Response
from knox.models import AuthToken
from rest_framework.decorators import api_view
from .models import User
from .serializers import UserSerializer, PublicUserSerializer


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
    serializer = PublicUserSerializer(user)
    return Response({"token": token, "user": serializer.data}, status=status.HTTP_200_OK)

@api_view(['POST'])
def register(request):
    serializer = UserSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    validated_data = serializer.validated_data
    validated_data['role'] = 'player' # Force role to 'player'
    
    user = User.objects.create(**validated_data)
    user.set_password(serializer.validated_data['password']) # Hash the password
    user.save()
    
    return Response({"message": "User successfully registered.", "user": UserSerializer(user).data}, status=status.HTTP_201_CREATED)

from rest_framework.decorators import authentication_classes, permission_classes
from knox.auth import TokenAuthentication
from rest_framework.permissions import IsAuthenticated

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def test_token(request):
    return Response("Passed for {}".format(request.user.email))

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_all_users(request):
    users = User.objects.all()
    serializer = PublicUserSerializer(users, many=True)
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
        if user == request.user: 
            serializer = UserSerializer(user)
        else:
            serializer = PublicUserSerializer(user)
            
        return Response(serializer.data)
    
    if user != request.user:
        return Response({"error": "You do not have permission to modify this user's profile."}, 
                        status=status.HTTP_403_FORBIDDEN)
    
    if request.method == 'PUT':
        allowed_fields = ['bio', 'country']
        updated_data = {key: value for key, value in request.data.items() if key in allowed_fields}
        
        serializer = UserSerializer(user, data=updated_data, partial=True)
        if not serializer.is_valid():
            return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer.save()
        return Response({"success": "Profile updated.", "user_data": serializer.data}, status=status.HTTP_200_OK)

    if request.method == 'DELETE':
        user.delete()
        return Response({"success": "User deleted."},status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def me(request):
    return Response({"me": UserSerializer(request.user).data}, status=status.HTTP_200_OK)