-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assessment" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "model_id" INTEGER NOT NULL,
    "storage_gb" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,

    CONSTRAINT "Assessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentFeedback" (
    "answer_id" SERIAL NOT NULL,
    "assessment_id" INTEGER NOT NULL,
    "rate" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssessmentFeedback_pkey" PRIMARY KEY ("answer_id")
);

-- CreateTable
CREATE TABLE "Brand" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Model" (
    "id" SERIAL NOT NULL,
    "brand_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "release_year" INTEGER NOT NULL,

    CONSTRAINT "Model_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentCondition" (
    "id" SERIAL NOT NULL,
    "assessment_id" INTEGER NOT NULL,
    "condition_id" INTEGER NOT NULL,
    "answer_option_id" INTEGER NOT NULL,
    "value_scale" INTEGER NOT NULL,
    "score_ratio" DOUBLE PRECISION NOT NULL,
    "final_score" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "AssessmentCondition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentPathScore" (
    "id" SERIAL NOT NULL,
    "assessment_id" INTEGER NOT NULL,
    "decision_path_id" INTEGER NOT NULL,
    "total_score" DOUBLE PRECISION NOT NULL,
    "score_physical" DOUBLE PRECISION NOT NULL,
    "score_functional" DOUBLE PRECISION NOT NULL,
    "score_age" DOUBLE PRECISION NOT NULL,
    "rank" INTEGER NOT NULL,
    "is_recommended" BOOLEAN NOT NULL,

    CONSTRAINT "AssessmentPathScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DecisionPath" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description_template" TEXT NOT NULL,
    "weight_physical" DOUBLE PRECISION NOT NULL,
    "weight_functional" DOUBLE PRECISION NOT NULL,
    "weight_age" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "DecisionPath_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConditionCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ConditionCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Condition" (
    "id" SERIAL NOT NULL,
    "category_id" INTEGER NOT NULL,
    "answer_group_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "answer_type" TEXT NOT NULL,
    "impact_weight" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Condition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnswerGroup" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "AnswerGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnswerOption" (
    "id" SERIAL NOT NULL,
    "group_id" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "default_ratio" DOUBLE PRECISION NOT NULL,
    "order_index" INTEGER NOT NULL,

    CONSTRAINT "AnswerOption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_name_key" ON "Brand"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ConditionCategory_name_key" ON "ConditionCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "AnswerGroup_name_key" ON "AnswerGroup"("name");

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "Model"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentFeedback" ADD CONSTRAINT "AssessmentFeedback_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "Assessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Model" ADD CONSTRAINT "Model_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentCondition" ADD CONSTRAINT "AssessmentCondition_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "Assessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentCondition" ADD CONSTRAINT "AssessmentCondition_condition_id_fkey" FOREIGN KEY ("condition_id") REFERENCES "Condition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentCondition" ADD CONSTRAINT "AssessmentCondition_answer_option_id_fkey" FOREIGN KEY ("answer_option_id") REFERENCES "AnswerOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentPathScore" ADD CONSTRAINT "AssessmentPathScore_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "Assessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentPathScore" ADD CONSTRAINT "AssessmentPathScore_decision_path_id_fkey" FOREIGN KEY ("decision_path_id") REFERENCES "DecisionPath"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Condition" ADD CONSTRAINT "Condition_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "ConditionCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Condition" ADD CONSTRAINT "Condition_answer_group_id_fkey" FOREIGN KEY ("answer_group_id") REFERENCES "AnswerGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnswerOption" ADD CONSTRAINT "AnswerOption_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "AnswerGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
