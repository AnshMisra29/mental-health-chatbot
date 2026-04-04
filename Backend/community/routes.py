from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from . import community_bp
from database.db import db
from database.models import CommunityPost

@community_bp.route("/posts", methods=["GET"])
@jwt_required()
def get_posts():
    try:
        # Get pagination parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        # Query community posts (most recent first)
        query = CommunityPost.query.order_by(CommunityPost.created_at.desc())
        
        # Pagination
        paginated = query.paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            "total": paginated.total,
            "pages": paginated.pages,
            "current_page": page,
            "per_page": per_page,
            "data": [p.to_dict() for p in paginated.items]
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@community_bp.route("/posts", methods=["POST"])
@jwt_required()
def create_post():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    if not data or not data.get("content") or not data.get("category"):
        return jsonify({"error": "Missing required fields"}), 400
        
    post = CommunityPost(
        user_id=user_id,
        title=data.get("title", "Community Update"),
        content=data.get("content"),
        category=data.get("category")
    )
    db.session.add(post)
    db.session.commit()
    
    return jsonify({"message": "Post created successfully", "data": post.to_dict()}), 201

@community_bp.route("/posts/<int:post_id>", methods=["DELETE"])
@jwt_required()
def delete_post(post_id):
    user_id = int(get_jwt_identity())
    post = CommunityPost.query.get_or_404(post_id)
    
    if post.user_id != user_id:
        return jsonify({"error": "Unauthorized"}), 403
        
    db.session.delete(post)
    db.session.commit()
    return jsonify({"message": "Post deleted successfully"}), 200
