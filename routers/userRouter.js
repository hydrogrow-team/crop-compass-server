const userRouter = require("express").Router();
const userController = require("../controllers/userController");
const authService = require("../middlewares/authService");

userRouter.post("/register", userController.createUser);
userRouter.post("/login", userController.userLogin);
userRouter.get("/my-info", authService, userController.getUserInfo);

// Apply these middlewares on the next routes
userRouter.use(authService);

userRouter.patch("/change-password/:id", userController.updatePassword);

userRouter
  .route("/:id")
  .put(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = userRouter;
