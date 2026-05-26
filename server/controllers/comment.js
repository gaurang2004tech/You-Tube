import comment from "../Modals/comment.js";
import mongoose from "mongoose";

// Regex: only allow letters, numbers, spaces, and basic punctuation
const SPECIAL_CHAR_REGEX = /[^a-zA-Z0-9 .,!?'"\-\n\u0900-\u097F\u0600-\u06FF\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\uAC00-\uD7A3]/;

export const postcomment = async (req, res) => {
  const { commentbody, city, ...rest } = req.body;

  // Block special characters
  if (commentbody && SPECIAL_CHAR_REGEX.test(commentbody)) {
    return res
      .status(400)
      .json({ message: "Special characters are not allowed in comments." });
  }

  const newComment = new comment({ commentbody, city: city || "", ...rest });
  try {
    const saved = await newComment.save();
    return res.status(200).json({ comment: true, data: saved });
  } catch (error) {
    console.error("error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getallcomment = async (req, res) => {
  const { videoid } = req.params;
  try {
    const commentvideo = await comment.find({ videoid: videoid });
    return res.status(200).json(commentvideo);
  } catch (error) {
    console.error("error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const deletecomment = async (req, res) => {
  const { id: _id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("comment unavailable");
  }
  try {
    await comment.findByIdAndDelete(_id);
    return res.status(200).json({ comment: true });
  } catch (error) {
    console.error("error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const editcomment = async (req, res) => {
  const { id: _id } = req.params;
  const { commentbody } = req.body;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("comment unavailable");
  }
  if (commentbody && SPECIAL_CHAR_REGEX.test(commentbody)) {
    return res
      .status(400)
      .json({ message: "Special characters are not allowed in comments." });
  }
  try {
    const updatecomment = await comment.findByIdAndUpdate(_id, {
      $set: { commentbody: commentbody },
    });
    res.status(200).json(updatecomment);
  } catch (error) {
    console.error("error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const likecomment = async (req, res) => {
  const { id: _id } = req.params;
  const { userId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("comment unavailable");
  }
  try {
    const found = await comment.findById(_id);
    if (!found) return res.status(404).json({ message: "Comment not found" });

    const userObjId = new mongoose.Types.ObjectId(userId);

    // Remove from dislikes if present
    found.dislikes = found.dislikes.filter(
      (id) => id.toString() !== userId.toString()
    );

    const alreadyLiked = found.likes.some(
      (id) => id.toString() === userId.toString()
    );
    if (alreadyLiked) {
      // Toggle off
      found.likes = found.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      found.likes.push(userObjId);
    }

    await found.save();
    return res
      .status(200)
      .json({ likes: found.likes.length, dislikes: found.dislikes.length });
  } catch (error) {
    console.error("error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const dislikecomment = async (req, res) => {
  const { id: _id } = req.params;
  const { userId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("comment unavailable");
  }
  try {
    const found = await comment.findById(_id);
    if (!found) return res.status(404).json({ message: "Comment not found" });

    const userObjId = new mongoose.Types.ObjectId(userId);

    // Remove from likes if present
    found.likes = found.likes.filter(
      (id) => id.toString() !== userId.toString()
    );

    const alreadyDisliked = found.dislikes.some(
      (id) => id.toString() === userId.toString()
    );
    if (alreadyDisliked) {
      // Toggle off
      found.dislikes = found.dislikes.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      found.dislikes.push(userObjId);
    }

    await found.save();

    // Auto-delete if dislikes reach 2
    if (found.dislikes.length >= 2) {
      await comment.findByIdAndDelete(_id);
      return res.status(200).json({ deleted: true });
    }

    return res
      .status(200)
      .json({ likes: found.likes.length, dislikes: found.dislikes.length });
  } catch (error) {
    console.error("error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
