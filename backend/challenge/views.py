from rest_framework import status
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser # Consider IsAdminUser for admin-specific actions
from knox.auth import TokenAuthentication
from rest_framework.response import Response
# from django.shortcuts import get_object_or_404 # Useful alternative

from .models import Category, Challenge, ChallengeSolve
from .serializers import ChallengeListSerializer, ChallengeSerializer, CategorySerializer, CategoryDetailSerializer, CreateChallengeSerializer, ChallengeSolveSerializer
# It's good practice to import your User model if you need to interact with it directly,
# e.g., from django.contrib.auth import get_user_model
# User = get_user_model()

# =================================================
# CRUD Category
# =================================================

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_categories(request):
    """
    Retrieve all categories.
    """
    try:
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True, context={"request":request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": f"An unexpected error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated]) # Consider [IsAdminUser] or custom permission
def create_category(request):
    """
    Create a new category.
    Requires admin privileges (conceptual - actual permission class not enforced here yet).
    """
    # Example admin check (if not using IsAdminUser permission class):
    # if not request.user.is_staff:
    #     return Response({"error": "You do not have permission to perform this action."}, status=status.HTTP_403_FORBIDDEN)
    
    serializer = CategorySerializer(data=request.data, context={'request':request})
    if serializer.is_valid():
        serializer.save()
        return Response({"success": "Successfully created category", "data": serializer.data}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated]) # Consider [IsAdminUser] or custom permission
def edit_categories(request, category_name):
    """
    Edit an existing category by its name.
    Requires admin privileges (conceptual).
    """
    # if not request.user.is_staff:
    #     return Response({"error": "You do not have permission to perform this action."}, status=status.HTTP_403_FORBIDDEN)
    try:
        category = Category.objects.get(name__iexact=category_name) # Case-insensitive lookup
        # For PUT, typically all fields are required. Use partial=True for PATCH-like behavior.
        serializer = CategorySerializer(category, data=request.data, partial=True, context={'request':request}) 
        if serializer.is_valid():
            serializer.save()
            return Response({"success": "Category successfully updated!", "data": serializer.data}, status=status.HTTP_200_OK)
        return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    except Category.DoesNotExist:
        return Response({"error": f"Category '{category_name}' not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": f"An unexpected error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated]) # Consider [IsAdminUser] or custom permission
def delete_categories(request, category_name):
    """
    Delete a category by its name.
    Requires admin privileges (conceptual).
    """
    # if not request.user.is_staff:
    #     return Response({"error": "You do not have permission to perform this action."}, status=status.HTTP_403_FORBIDDEN)
    try:
        category = Category.objects.get(name__iexact=category_name)
        category_name_deleted = category.name # Store for message
        category.delete()
        # HTTP 200 OK with a message body, or HTTP 204 No Content if no body is preferred.
        return Response({"success": f"Category '{category_name_deleted}' deleted successfully"}, status=status.HTTP_200_OK)
    except Category.DoesNotExist:
        return Response({"error": f"Category '{category_name}' not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": f"An unexpected error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# =================================================
# Challenges by Category
# =================================================

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_challenges_by_categories(request, category_name):
    """
    Retrieve challenges based on a category name.
    Uses CategoryDetailSerializer (as defined in your serializers.py, which serializes Challenge objects
    with specific fields: title, difficutly, point).
    """
    try:
        category = Category.objects.get(name__iexact=category_name)
    except Category.DoesNotExist:
        return Response({'error': f'Category "{category_name}" not found.'}, status=status.HTTP_404_NOT_FOUND)
    
    try:
        # Assuming 'challenge' is the related_name from Category to Challenge in your Challenge model's ForeignKey
        # If Challenge.category = ForeignKey(Category, related_name="challenge"), then category.challenge.all() works.
        # Or, more explicitly:
        challenges = Challenge.objects.filter(category=category)
        
        if not challenges.exists():
            return Response({'message': f'No challenges found in the category: {category.name}'}, status=status.HTTP_200_OK) # Or 404 if preferred
            
        # Your CategoryDetailSerializer is defined with Meta.model = Challenge
        # and fields = ['title', 'difficutly', 'point']. This will serialize the list of Challenge objects.
        serializer = CategoryDetailSerializer(challenges, many=True)
        return Response({"category": category.name, "challenges": serializer.data}, status=status.HTTP_200_OK)
    except Exception as e: # Catch other potential errors during challenge fetching or serialization
        return Response({"error": f"An error occurred while fetching challenges: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# =================================================
# CRUD Challenge
# =================================================

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_all_challenges(request):
    """
    Retrieve a list of all challenges.
    Uses ChallengeSerializer which excludes the flag.
    """
    try:
        challenges = Challenge.objects.all()
        serializer = ChallengeListSerializer(challenges, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": f"An unexpected error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_challenge_detail(request, challenge_id):
    """
    Retrieve details of a specific challenge by its ID.
    Uses ChallengeSerializer which excludes the flag.
    """
    try:
        challenge = Challenge.objects.get(pk=challenge_id)
        serializer = ChallengeSerializer(challenge) # many=False is default for single object
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Challenge.DoesNotExist:
        return Response({'error': f'Challenge with ID {challenge_id} not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": f"An unexpected error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated]) # Or IsAdminUser / custom permission for who can create challenges
def create_challenge(request):
    """
    Create a new challenge.
    The 'author' will be set to the authenticated user.
    'attachment' should be sent as a file in a multipart/form-data request.
    """
    
    # Defaults like solve_count, rating are handled by model defaults.
    # No need to set data['attachment'] = '' here;
    # CreateChallengeSerializer will handle the file from request.FILES if provided.

    # Pass request.FILES to the serializer if handling file uploads
    serializer = CreateChallengeSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save() # Author is already part of the data passed to serializer
        return Response({"success": "Challenge successfully created", "data": serializer.data}, status=status.HTTP_201_CREATED)
    return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def edit_challenge(request, challenge_id):
    """
    Edit an existing challenge by its ID.
    Only the author or an admin (conceptual) can edit.
    """
    try:
        challenge = Challenge.objects.get(pk=challenge_id)

        # Permission check: Only author or admin (e.g., request.user.is_staff)
        if challenge.author != request.user and not request.user.role == "admin": # Assuming request.user is your 'user.User' model instance
            return Response({"error": "You do not have permission to edit this challenge."}, status=status.HTTP_403_FORBIDDEN)

        # Use CreateChallengeSerializer for updates to allow all fields to be changed, or a specific UpdateChallengeSerializer.
        # partial=True allows for partial updates (PATCH behavior).
        serializer = CreateChallengeSerializer(challenge, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({"success": "Challenge successfully updated!", "challenge_data": serializer.data}, status=status.HTTP_200_OK)
        return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    except Challenge.DoesNotExist:
        return Response({"error": f"Challenge with ID {challenge_id} not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": f"An unexpected error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def delete_challenge(request, challenge_id):
    """
    Delete a challenge by its ID.
    Only the author or an admin (conceptual) can delete.
    """
    try:
        challenge = Challenge.objects.get(pk=challenge_id)

        if challenge.author != request.user and request.user.role != "admin":
            return Response({"error": "You do not have permission to delete this challenge."}, status=status.HTTP_403_FORBIDDEN)
        
        challenge_title = challenge.title # For the success message
        challenge.delete()
        return Response({"success": f"Challenge '{challenge_title}' deleted successfully"}, status=status.HTTP_200_OK) # Or HTTP_204_NO_CONTENT
    except Challenge.DoesNotExist:
        return Response({"error": f"Challenge with ID {challenge_id} not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": f"An unexpected error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def submit_flag(request, challenge_id):
    """
    SUBMIT FLEG
    """
    if not request.user.team:
        return Response({"message": f"You must join a team to submit a flag!"}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        challenge = Challenge.objects.get(pk=challenge_id)
    except Challenge.DoesNotExist:
        return Response({"message": f"Challenge does not exists."}, status=status.HTTP_404_NOT_FOUND)
    
    user_submitted_flag = request.data.get('flag')
    if user_submitted_flag is None:
        return Response({"message": f"Specify the flag bro.."}, status=status.HTTP_400_BAD_REQUEST)
    
    if ChallengeSolve.objects.filter(user=request.user, challenge=challenge).exists():
        return Response({"message": "You already solved this challenge."}, status=status.HTTP_400_BAD_REQUEST)
    
    team_members = request.user.team.members.all()
    if ChallengeSolve.objects.filter(user__in=team_members, challenge=challenge).exists():
        return Response({"message": "Your team already solved this challenge."}, status=status.HTTP_400_BAD_REQUEST)
    
    
    if challenge.flag != user_submitted_flag:
        return Response({"message": f"Wrong answer."}, status=status.HTTP_400_BAD_REQUEST)
    
    ChallengeSolve.objects.create(user=request.user, challenge=challenge)
    
    return Response({"message":"Correct."}, status=status.HTTP_200_OK)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def solved_by_me(request):
    """
    Delete a challenge by its ID.
    Only the author or an admin (conceptual) can delete.
    """
    solves = ChallengeSolve.objects.filter(user=request.user)
    if not solves.exists():
        return Response({"message": f"You have not solved any challenges yet."}, status=status.HTTP_404_NOT_FOUND)
    
    return Response(ChallengeSolveSerializer(solves, many=True).data, status=status.HTTP_200_OK)


@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def solved_by_team(request):
    if not request.user.team:
        return Response({"message": f"You haven't joined a team"}, status=status.HTTP_404_NOT_FOUND)
    
    
    team_members = request.user.team.members.all()
    solves = ChallengeSolve.objects.filter(user__in=team_members)
    
    if not solves.exists():
        return Response({"message": f"Your team haven't solved any challenges"}, status=status.HTTP_404_NOT_FOUND)

    return Response({"message": ChallengeSolveSerializer(solves, many=True).data}, status=status.HTTP_200_OK)
