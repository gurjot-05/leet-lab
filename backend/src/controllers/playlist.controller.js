import { db } from "../libs/db.js";

export const getAllPlaylists = async (req, res) => {
  try {
    const userId = req.existingUser.id;
    const playlists = await db.playlist.findMany({
      where: {
        userId,
      },
      include: {
        problems: {
          include: {
            problem: true,
          },
        },
      },
    });

    if (!playlists) {
      return res.status(404).json({
        message: "No playlist found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Playlists fetched successfully",
      playlists,
    });
  } catch (error) {
    console.error(`Failed to fetch playlists: ${error}`);
    return res.status(500).json({
      message: `Failed to fetch playlists`,
    });
  }
};

export const getOnePlaylist = async (req, res) => {
  try {
    const playlistId = req.params.playlistId;

    const playlist = await db.playlist.findUnique({
      where: {
        id: playlistId,
      },
      include: {
        problems: {
          include: {
            problem: true,
          },
        },
      },
    });

    if (!playlist) {
      return res.status(404).json({
        message: "No playlist found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Playlist fetched successfully",
      playlist,
    });
  } catch (error) {
    console.error(`Failed to fetch playlist: ${error}`);
    return res.status(500).json({
      message: `Failed to fetch playlist`,
    });
  }
};

export const createPlaylist = async (req, res) => {
  try {
    const userId = req.existingUser.id;
    const { name, description } = req.body;

    const playlist = await db.playlist.create({
      data: {
        userId,
        name,
        description,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Playlist created successfully",
      playlist,
    });
  } catch (error) {
    console.error(`Failed to create playlist: ${error}`);

    if (error.code === "P2002") {
      return res.status(400).json({
        message: "You already have a playlist with this name.",
      });
    }

    return res.status(500).json({
      message: `Failed to create playlist`,
    });
  }
};

export const addProblemToPlaylist = async (req, res) => {
  try {
    const playlistId = req.params.playlistId;
    const { problemIds } = req.body;

    if (!Array.isArray(problemIds) || problemIds.length === 0) {
      return res.status(400).json({
        message: "Invalid or missing problemIds",
      });
    }
    const problems = await db.problemsinPlaylist.createMany({
      data: problemIds.map((problemId) => ({
        playlistId,
        problemId,
      })),
    });

    if (!problems) {
      return res.status(404).json({
        message: "Playlist or problems not found",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Problems added successfully",
      problems,
    });
  } catch (error) {
    console.error(`Failed to add problems: ${error}`);
    return res.status(500).json({
      message: `Failed to add problems`,
    });
  }
};

export const deletePlaylist = async (req, res) => {
  try {
    const playlistId = req.params.playlistId;

    await db.playlist.delete({
      where: {
        id: playlistId,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Playlist deleted successfully",
    });
  } catch (error) {
    console.error(`Failed to delete playlist: ${error}`);
    return res.status(500).json({
      message: `Failed to delete playlist`,
    });
  }
};

export const removeProblemFromPlaylist = async (req, res) => {
  try {
    const playlistId = req.params.playlistId;
    const { problemIds } = req.body;

    if (!Array.isArray(problemIds) || problemIds.length === 0) {
      return res.status(400).json({
        message: "Invalid or missing problemIds",
      });
    }

    await db.problemsinPlaylist.deleteMany({
      where: {
        playlistId,
        problemId: {
          in: problemIds,
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Problem deleted successfully",
    });
  } catch (error) {
    console.error(`Failed to delete problems from the playlist: ${error}`);
    return res.status(500).json({
      message: `Failed to delete problems from the playlist`,
    });
  }
};
