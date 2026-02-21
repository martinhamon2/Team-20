"use client";

import { useTranslation } from "react-i18next";
import RegistrationService from "@/service/RegistrationService";
import type { Event, RegistrationInput, Session } from "@/types";
import { useEffect, useRef, useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Loader,
  Check,
  AlertCircle,
  ChevronRight,
  X,
  ChevronLeft,
} from "lucide-react";
import {
  firstNameSchema,
  lastNameSchema,
  emailSchema,
  phoneSchemaInternational,
  phoneSchemaNational,
  addressSchema,
  countySchema,
  postcodeSchema,
  schoolSchema,
  dateOfBirthSchema,
  correspondenceLanguageSchema,
  CHAR_LIMITS,
} from "@/lib/validation-schemas";

interface Props {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
  selectedSessions: Session[];
  onClearSessions?: () => void;
  // NIEUW: Prop om de resterende tijd door te geven
  timeLeft?: number | null;
}

interface ChatMessage {
  id: string;
  type:
    | "question"
    | "answer"
    | "thinking"
    | "success"
    | "error"
    | "summary"
    | "pending"
    | "sessions";
  content: string;
  field?: string;
  timestamp?: Date;
}

interface Question {
  field: string;
  label: string;
  placeholder: string;
  response: string;
}

export default function ChatRegistrationPanel({
  event,
  isOpen,
  onClose,
  selectedSessions,
  onClearSessions,
  timeLeft, // Destructure de prop
}: Props) {
  const { t, i18n } = useTranslation();

  // -- State Definitions --
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [inputValue, setInputValue] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sessions, setSessions] = useState<Session[]>(selectedSessions);
  const [confirmationStep, setConfirmationStep] = useState<boolean>(false);
  const [confirmInput, setConfirmInput] = useState<string>("");
  const [summaryData, setSummaryData] = useState<
    { label: string; value: string }[]
  >([]);
  const [highlightedAnswerId, setHighlightedAnswerId] = useState<string | null>(
    null,
  );
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingFieldLabel, setEditingFieldLabel] = useState<string>("");
  const [charCount, setCharCount] = useState<number>(0);
  const [maxChars, setMaxChars] = useState<number>(0);

  // -- Refs --
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const registrationFinished = messages.some((msg) => msg.type === "success");

  // -- Helper: Format Timer (mm:ss) --
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const getQuestions = (event: Event): Question[] => {
    const phonePlaceholder =
      event.eventSetting?.phoneFormat === "INTERNATIONAL"
        ? t("registration.questions.phone.placeholder.international")
        : t("registration.questions.phone.placeholder.national");

    const description = (event.description || "").toLowerCase();
    const isOpenlesdagen = description.includes("openlesdagen");

    const questions: Question[] = [
      {
        field: "email",
        label: t("registration.questions.email.label"),
        placeholder: t("registration.questions.email.placeholder"),
        response: t("registration.questions.firstName.response"),
      },
      {
        field: "firstName",
        label: t("registration.questions.firstName.label"),
        placeholder: t("registration.questions.firstName.placeholder"),
        response: t("registration.questions.lastName.question"),
      },
      {
        field: "lastName",
        label: t("registration.questions.lastName.label"),
        placeholder: t("registration.questions.lastName.placeholder"),
        response: t("registration.questions.dateOfBirth.question"),
      },
      {
        field: "dateOfBirth",
        label: t("registration.questions.dateOfBirth.label"),
        placeholder: "DD/MM/YYYY",
        response: t("registration.questions.correspondenceLanguage.question"),
      },
      {
        field: "correspondenceLanguage",
        label: t("registration.questions.correspondenceLanguage.label"),
        placeholder: t(
          "registration.questions.correspondenceLanguage.placeholder",
        ),
        response: isOpenlesdagen
          ? t("registration.questions.school.question")
          : t("registration.questions.phone.question"),
      },
    ];

    if (isOpenlesdagen) {
      questions.push(
        {
          field: "school",
          label: t("registration.questions.school.label"),
          placeholder: t("registration.questions.school.placeholder"),
          response: t("registration.questions.startYear.question"),
        },
        {
          field: "startYear",
          label: t("registration.questions.startYear.label"),
          placeholder: "YYYY",
          response: t("registration.questions.phone.question"),
        },
      );
    }

    questions.push(
      {
        field: "phoneNumber",
        label: t("registration.questions.phone.label"),
        placeholder: phonePlaceholder,
        response: t("registration.questions.address.question"),
      },
      {
        field: "address",
        label: t("registration.questions.address.label"),
        placeholder: t("registration.questions.address.placeholder"),
        response: t("registration.questions.county.question"),
      },
      {
        field: "county",
        label: t("registration.questions.county.label"),
        placeholder: t("registration.questions.county.placeholder"),
        response: t("registration.questions.postcode.question"),
      },
      {
        field: "postcode",
        label: t("registration.questions.postcode.label"),
        placeholder: t("registration.questions.postcode.placeholder"),
        response: t("registration.thanks.completed"),
      },
    );

    return questions;
  };

  const [QUESTIONS, setQUESTIONS] = useState<Question[]>([]);

  // -- Form Data State --
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
    county: "",
    postcode: "",
    school: "",
    dateOfBirth: "",
    correspondenceLanguage: "",
    startYear: "",
  });

  useEffect(() => {
    setSessions(selectedSessions);
  }, [selectedSessions]);

  // Initialize Questions based on Event
  useEffect(() => {
    setQUESTIONS(getQuestions(event));
    setCurrentQuestionIndex(0);
  }, [event, t]);

  // Auto-scroll
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-focus input
  useEffect(() => {
    inputRef.current?.focus();
  }, [currentQuestionIndex, confirmationStep, editingField]);

  // Initial Welcome Message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const sessionsMessage: ChatMessage = {
        id: "sessions",
        type: "sessions",
        content: "",
        timestamp: new Date(),
      };

      const firstQuestion = QUESTIONS[0];

      const welcomeMessage: ChatMessage = {
        id: "welcome-intro",
        type: "question",
        content: t("registration.welcome.intro", {
          placeholder:
            firstQuestion?.placeholder ||
            t("registration.welcome.defaultPrompt"),
        }),
        timestamp: new Date(),
      };

      setMessages([sessionsMessage, welcomeMessage]);
    }
  }, [isOpen, messages.length, QUESTIONS, t]);

  // Character limits
  useEffect(() => {
    const currentQuestion = QUESTIONS[currentQuestionIndex];
    if (currentQuestion) {
      const limit =
        CHAR_LIMITS[currentQuestion.field as keyof typeof CHAR_LIMITS] || 100;
      setMaxChars(limit);
      setCharCount(inputValue.length);
    }
  }, [inputValue, currentQuestionIndex, QUESTIONS]);

  // -- Validation Logic --
  const validateField = (field: string, value: string): string | null => {
    try {
      switch (field) {
        case "firstName":
          firstNameSchema.parse(value);
          return null;

        case "lastName":
          lastNameSchema.parse(value);
          return null;

        case "dateOfBirth":
          dateOfBirthSchema.parse(value);
          return null;

        case "correspondenceLanguage":
          correspondenceLanguageSchema.parse(value);
          return null;

        case "email":
          emailSchema.parse(value);
          return null;

        case "phoneNumber":
          const phoneFormat = event.eventSetting?.phoneFormat;
          if (phoneFormat === "INTERNATIONAL") {
            phoneSchemaInternational.parse(value);
          } else {
            phoneSchemaNational.parse(value);
          }
          return null;

        case "address":
          addressSchema.parse(value);
          return null;

        case "county":
          countySchema.parse(value);
          return null;

        case "postcode":
          postcodeSchema.parse(value);
          return null;

        case "school":
          schoolSchema.parse(value);
          return null;

        case "startYear":
          const year = parseInt(value);
          if (
            isNaN(year) ||
            year < 1900 ||
            year > new Date().getFullYear() + 10
          ) {
            return t("registration.validation.invalidYear");
          }
          return null;

        default:
          return null;
      }
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "errors" in error) {
        const errObj = error as { errors: { message: string }[] };
        if (errObj.errors && errObj.errors[0]) {
          return errObj.errors[0].message;
        }
      }
      return t("general.invalidInput");
    }
  };

  const isSubmitInputEmpty = () => {
    if (editingField) return !confirmInput.trim();
    if (confirmationStep) return !confirmInput.trim();
    return !inputValue.trim();
  };

  // -- Handlers --

  const handleSubmitAnswer = async () => {
    if (!inputValue.trim() || isLoading) return;

    const currentQuestion = QUESTIONS[currentQuestionIndex];
    if (!currentQuestion) return;

    const error = validateField(currentQuestion.field, inputValue);

    if (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          type: "error",
          content: error,
          timestamp: new Date(),
        },
      ]);
      return;
    }

    const pendingId = `pending-${Date.now()}`;
    const userInput = inputValue;

    setMessages((prev) => [
      ...prev,
      {
        id: pendingId,
        type: "pending",
        content: userInput,
        field: currentQuestion.field,
        timestamp: new Date(),
      },
    ]);

    setInputValue("");
    setCharCount(0);
    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 800));

    const nextFormData = {
      ...formData,
      [currentQuestion.field]:
        currentQuestion.field === "postcode" ? Number(userInput) : userInput,
    } as typeof formData;

    setFormData(nextFormData);

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === pendingId ? { ...msg, type: "answer" as const } : msg,
      ),
    );
    setHighlightedAnswerId(pendingId);
    setTimeout(() => setHighlightedAnswerId(null), 400);

    if (currentQuestion.field === "email") {
      try {
        const response = await RegistrationService.precheck(
          nextFormData.email,
          sessions
            .map((s) => s.id)
            .filter((id): id is string => id !== undefined),
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));

          if (response.status === 409) {
            const conflictMessage: ChatMessage = {
              id: `bot-conflict-${Date.now()}`,
              type: "error",
              content: t("registration.precheck.conflict"),
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, conflictMessage]);
            setIsLoading(false);
            return;
          }
          if (
            response.status === 500 &&
            errorData.message &&
            errorData.message.includes(
              "Registration failed for the following sessions",
            )
          ) {
            const conflictMessage: ChatMessage = {
              id: `bot-conflict-${Date.now()}`,
              type: "error",
              content: t("registration.precheck.overlapping"),
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, conflictMessage]);
            setIsLoading(false);
            return;
          }

          const message = errorData.message || t("registration.precheck.error");

          setMessages((prev) => [
            ...prev,
            {
              id: `bot-email-error-${Date.now()}`,
              type: "error",
              content: message,
              timestamp: new Date(),
            },
          ]);
          setIsLoading(false);
          return;
        }
      } catch (err: unknown) {
        let message = t("registration.precheck.sendError");

        if (err instanceof Error) {
          message = err.message;
        }

        setMessages((prev) => [
          ...prev,
          {
            id: `bot-email-error-${Date.now()}`,
            type: "error",
            content: message,
            timestamp: new Date(),
          },
        ]);
        setIsLoading(false);
        return;
      }
    }

    if (currentQuestion.response) {
      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        type: "question",
        content: currentQuestion.response,
        field: currentQuestion.field,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    }

    setIsLoading(false);

    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      handleShowSummary(nextFormData);
    }
  };

  const handleShowSummary = async (data: typeof formData) => {
    setIsLoading(true);
    const summaryEntries = Object.entries(data)
      .map(([key, value]) => {
        const label = QUESTIONS.find((q) => q.field === key)?.label || key;
        if (value === "" || value === undefined) return null;

        return {
          label,
          value: value ? String(value) : t("general.notApplicable"),
        };
      })
      .filter(
        (item): item is { label: string; value: string } => item !== null,
      );

    const summaryMessage: ChatMessage = {
      id: `summary-${Date.now()}`,
      type: "summary",
      content: "",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, summaryMessage]);
    setSummaryData(summaryEntries);
    await new Promise((resolve) => setTimeout(resolve, 400));
    setIsLoading(false);
    setConfirmationStep(true);
  };

  const handleEditField = (fieldName: string, label: string) => {
    if (!fieldName) return;
    setEditingField(fieldName);
    setEditingFieldLabel(label);

    const currentValue = formData[fieldName as keyof typeof formData];
    setConfirmInput(currentValue ? String(currentValue) : "");

    setMessages((prev) => [
      ...prev,
      {
        id: `edit-prompt-${Date.now()}`,
        type: "question",
        content: t("registration.summary.editPrompt", { label: label }),
        field: fieldName,
        timestamp: new Date(),
      },
    ]);

    inputRef.current?.focus();
  };

  const handleEditSubmit = async () => {
    if (!confirmInput.trim() || isLoading || !editingField) return;

    const error = validateField(editingField, confirmInput);
    if (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          type: "error",
          content: error,
          timestamp: new Date(),
        },
      ]);
      return;
    }

    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 400));

    setFormData((prev) => ({
      ...prev,
      [editingField]:
        editingField === "postcode" ? Number(confirmInput) : confirmInput,
    }));

    const newSummaryData = summaryData.map((item) =>
      item.label === editingFieldLabel
        ? { ...item, value: confirmInput }
        : item,
    );
    setSummaryData(newSummaryData);

    const summaryMessage: ChatMessage = {
      id: `summary-${Date.now()}`,
      type: "summary",
      content: "",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, summaryMessage]);

    setEditingField(null);
    setEditingFieldLabel("");
    setConfirmInput("");
    setIsLoading(false);
  };

  const handleConfirmation = async () => {
    if (!confirmInput.trim() || isLoading) return;
    if (confirmInput.toLowerCase() !== "confirm") {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          type: "error",
          content: t("registration.validation.confirm"),
          timestamp: new Date(),
        },
      ]);
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        id: `confirm-${Date.now()}`,
        type: "answer",
        content: confirmInput,
        timestamp: new Date(),
      },
    ]);
    setConfirmInput("");
    setIsLoading(true);
    handleFinalSubmission();
  };

  const handleFinalSubmission = async () => {
    const thinkingId = `thinking-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: thinkingId,
        type: "thinking",
        content: t("registration.submission.processing"),
        timestamp: new Date(),
      },
    ]);

    try {
      const validSessionIds = sessions
        .map((s) => s.id)
        .filter((id): id is string => id !== undefined);

      const registrationInput: RegistrationInput = {
        sessionIds: validSessionIds,
        ...formData,
        postcode: Number(formData.postcode),
        startYear: formData.startYear ? Number(formData.startYear) : undefined,

        school: formData.school || "",

        correspondenceLanguage:
          formData.correspondenceLanguage || i18n.language || "nl",

        dateOfBirth: formData.dateOfBirth,
      };

      const response = await RegistrationService.registrate(registrationInput);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === thinkingId
            ? {
                ...msg,
                type: response?.ok ? "success" : "error",
                content: response?.ok
                  ? t("registration.submission.success")
                  : t("registration.submission.errorGeneric"),
              }
            : msg,
        ),
      );
    } catch (err: unknown) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === thinkingId
            ? {
                ...msg,
                type: "error",
                content:
                  err instanceof Error
                    ? err.message
                    : t("general.anErrorOccurred"),
              }
            : msg,
        ),
      );
    }

    setIsLoading(false);
    setConfirmationStep(false);
  };

  // -- Render Helpers --

  const isComplete =
    registrationFinished ||
    (currentQuestionIndex >= QUESTIONS.length && !confirmationStep);

  const progressPercent = QUESTIONS.length
    ? ((Math.min(currentQuestionIndex, QUESTIONS.length - 1) + 1) /
        QUESTIONS.length) *
      100
    : 0;

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return t("general.notApplicable");
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString(t("general.locale"), {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (time: string | undefined) =>
    time || t("general.notApplicable");

  const handleClose = () => {
    // Clear all chat state
    setMessages([]);
    setCurrentQuestionIndex(0);
    setInputValue("");
    setIsLoading(false);
    setConfirmationStep(false);
    setConfirmInput("");
    setSummaryData([]);
    setHighlightedAnswerId(null);
    setEditingField(null);
    setEditingFieldLabel("");
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      address: "",
      county: "",
      postcode: "",
      school: "",
      dateOfBirth: "",
      correspondenceLanguage: "",
      startYear: "",
    });

    if (onClearSessions) {
      onClearSessions();
    }
    onClose();
  };

  const handleGoBack = () => {
    if (editingField || confirmationStep) return;
    if (currentQuestionIndex === 0) return;

    setMessages((prev) => {
      const copy = [...prev];
      copy.pop();
      copy.pop();
      return copy;
    });

    setInputValue("");
    setCharCount(0);
    setCurrentQuestionIndex((prev) => prev - 1);
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 hidden bg-black/50 transition-opacity lg:block"
        onClick={handleClose}
      />

      <div className="fixed inset-0 z-50 flex h-dvh w-full flex-col bg-white shadow-2xl lg:left-auto lg:w-[480px] lg:max-w-[90vw]">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200"
          aria-label={t("general.close")}
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {/* Main Chat Section */}
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex shrink-0 flex-col bg-[#004070] px-6 py-4 transition-colors duration-500">
              {/* HEADER MET TITEL EN TIMER */}
              <div className="mr-12 flex flex-col gap-2">
                <h1 className="text-xl font-bold text-white!">
                  {t("registration.title", { eventType: event.description })}
                </h1>

                {/* TIMER WEERGAVE */}
                {timeLeft !== undefined &&
                  timeLeft !== null &&
                  !registrationFinished && (
                    <div
                      className={`flex w-fit items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold shadow-sm transition-colors ${
                        timeLeft <= 10
                          ? "animate-pulse bg-red-500 text-white"
                          : "bg-white/20 text-white backdrop-blur-sm"
                      }`}
                    >
                      <Clock size={14} />
                      <span className="font-variant-numeric tabular-nums">
                        {formatTimer(timeLeft)}
                      </span>
                    </div>
                  )}
              </div>

              <div
                className={`mt-3 h-2 w-full rounded-full transition-colors duration-500 ${
                  registrationFinished ? "bg-green-700" : "bg-[#1a5a8a]"
                }`}
              >
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    registrationFinished ? "bg-green-500" : "bg-[#3690ad]"
                  }`}
                  style={{
                    width: `${registrationFinished ? 100 : progressPercent}%`,
                  }}
                />
              </div>
              <p className="mt-2 text-sm text-white/90">
                {registrationFinished
                  ? t("registration.status.completed")
                  : t("registration.stepIndicator", {
                      current: Math.min(
                        currentQuestionIndex + 1,
                        QUESTIONS.length || 1,
                      ),
                      total: QUESTIONS.length || 0,
                    })}
              </p>
            </div>

            <div
              ref={messagesContainerRef}
              className="pb-safe min-h-0 flex-1 space-y-4 overflow-y-auto scroll-smooth bg-white p-6"
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className="animate-in fade-in slide-in-from-bottom-2 duration-300"
                >
                  {message.type === "sessions" &&
                    sessions &&
                    sessions.length > 0 && (
                      <div className="flex gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#3690ad] shadow-lg">
                          <span className="text-lg">🤖</span>
                        </div>
                        <div className="flex-1">
                          <div className="rounded-2xl bg-[#f0f7fc] px-4 py-3 shadow-sm">
                            <p className="mb-3 text-sm font-semibold text-[#1a3a4a]">
                              {t("registration.sessionsMessage.intro", {
                                count: sessions.length,
                              })}
                            </p>
                            <div className="space-y-2">
                              {sessions.map((session, index) => (
                                <div
                                  key={session.id || index}
                                  className="rounded-lg border border-[#d0e0ed] bg-white p-3"
                                >
                                  <div className="flex flex-col gap-1.5">
                                    <h3 className="text-sm font-semibold text-[#004070]">
                                      {session.type}
                                    </h3>
                                    {session.category && (
                                      <span className="inline-flex w-fit rounded-full bg-[#e8f4f8] px-2 py-0.5 text-[10px] font-medium text-[#3690ad]">
                                        {session.category}
                                      </span>
                                    )}
                                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[#556b7a]">
                                      {(session.beginDate ||
                                        session.endDate) && (
                                        <div className="flex items-center gap-1">
                                          <Calendar className="h-3 w-3 text-[#3690ad]" />
                                          <span>
                                            {session.beginDate &&
                                              formatDate(session.beginDate)}
                                            {session.endDate &&
                                              session.beginDate !==
                                                session.endDate &&
                                              ` - ${formatDate(
                                                session.endDate,
                                              )}`}
                                          </span>
                                        </div>
                                      )}
                                      {(session.beginTime ||
                                        session.endTime) && (
                                        <div className="flex items-center gap-1">
                                          <Clock className="h-3 w-3 text-[#3690ad]" />
                                          <span>
                                            {formatTime(session.beginTime)}
                                            {session.endTime &&
                                              ` - ${formatTime(
                                                session.endTime,
                                              )}`}
                                          </span>
                                        </div>
                                      )}
                                      {session.location && (
                                        <div className="flex items-center gap-1">
                                          <MapPin className="h-3 w-3 text-[#3690ad]" />
                                          <span>{session.location}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                  {message.type === "question" && (
                    <div className="flex gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#3690ad] shadow-lg">
                        <span className="text-lg">🤖</span>
                      </div>
                      <div className="flex-1">
                        <div className="rounded-2xl bg-[#f0f7fc] px-4 py-3 shadow-sm">
                          <p className="text-sm font-medium text-[#1a3a4a]">
                            {message.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {message.type === "pending" && (
                    <div className="flex justify-end gap-3">
                      <div className="max-w-xs animate-pulse rounded-2xl border-2 border-dashed border-gray-300 px-4 py-3 text-sm text-gray-700">
                        {message.content}
                      </div>
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e8f0f5]">
                        <span className="text-lg">👤</span>
                      </div>
                    </div>
                  )}

                  {message.type === "answer" && (
                    <div className="flex justify-end gap-3">
                      <div
                        className={`max-w-xs rounded-2xl bg-[#00b0e0] px-4 py-3 text-white shadow-lg transition-all ${
                          highlightedAnswerId === message.id
                            ? "bg-green-600!"
                            : ""
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e8f0f5]">
                        <span className="text-lg">👤</span>
                      </div>
                    </div>
                  )}

                  {message.type === "thinking" && (
                    <div className="flex gap-3">
                      <div className="flex h-10 w-10 shrink-0 animate-pulse items-center justify-center rounded-full bg-[#c5dce8]">
                        <Loader className="h-5 w-5 animate-spin text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="rounded-2xl bg-[#e0f0fa] px-4 py-3 text-sm text-[#1a3a4a] shadow-sm">
                          {t("registration.submission.processing")}
                        </div>
                      </div>
                    </div>
                  )}

                  {message.type === "error" && (
                    <div className="border-destructive/30 bg-destructive/10 my-4 flex items-start gap-3 rounded-lg border p-4">
                      <AlertCircle className="text-destructive mt-0.5 h-5 w-5 shrink-0" />
                      <div className="flex-1">
                        <p className="text-destructive text-sm leading-relaxed">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  )}

                  {message.type === "success" && (
                    <div className="my-4 flex items-start gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
                      <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <p className="text-sm leading-relaxed text-emerald-700 dark:text-emerald-300">
                        {t("registration.submission.success")}
                      </p>
                    </div>
                  )}

                  {message.type === "summary" && summaryData.length > 0 && (
                    <div className="space-y-2 rounded-2xl bg-[#f0f7fc] px-4 py-3 text-sm text-[#1a3a4a] shadow-sm">
                      <p className="font-medium">
                        {t("registration.summary.intro")}
                      </p>
                      <div className="space-y-1 pr-2">
                        {summaryData.map((item) => (
                          <p
                            key={item.label}
                            onClick={() =>
                              !editingField &&
                              handleEditField(
                                QUESTIONS.find((q) => q.label === item.label)
                                  ?.field || "",
                                item.label,
                              )
                            }
                            className="cursor-pointer rounded px-2 py-1 transition-colors hover:bg-[#d9e9f3]"
                            title={
                              editingField
                                ? ""
                                : t("registration.summary.clickToEdit")
                            }
                          >
                            <strong>{item.label}:</strong> {item.value}
                          </p>
                        ))}
                      </div>

                      <p className="mt-2 text-xs text-[#556b7a] italic">
                        {t("registration.summary.tip")}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {registrationFinished ? (
              <div className="pb-safe flex shrink-0 gap-3 border-t border-[#d0e0ed] bg-white px-3 py-4">
                <button
                  onClick={handleClose}
                  className="flex flex-1 items-center justify-center rounded-xl bg-[#3690ad] px-4 py-3 text-white shadow-lg transition-all hover:bg-[#004070]"
                >
                  {t("general.close")}
                </button>
              </div>
            ) : (
              !isComplete && (
                <div className="pb-safe flex shrink-0 flex-col gap-2 border-t border-[#d0e0ed] bg-white px-3 py-4">
                  {!confirmationStep && !editingField && (
                    <div className="flex justify-end">
                      <span
                        className={`text-xs ${
                          charCount > maxChars
                            ? "font-semibold text-red-600"
                            : charCount > maxChars * 0.9
                              ? "text-orange-600"
                              : "text-gray-500"
                        }`}
                      >
                        {charCount} / {maxChars}
                      </span>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <input
                      ref={inputRef}
                      type="text"
                      value={
                        editingField || confirmationStep
                          ? confirmInput
                          : inputValue
                      }
                      maxLength={
                        editingField
                          ? CHAR_LIMITS[
                              editingField as keyof typeof CHAR_LIMITS
                            ]
                          : confirmationStep
                            ? 20
                            : QUESTIONS[currentQuestionIndex]?.field
                              ? CHAR_LIMITS[
                                  QUESTIONS[currentQuestionIndex]
                                    .field as keyof typeof CHAR_LIMITS
                                ]
                              : undefined
                      }
                      placeholder={
                        editingField
                          ? t("registration.input.placeholder.edit", {
                              label: editingFieldLabel,
                            })
                          : confirmationStep
                            ? t("registration.input.placeholder.confirm")
                            : QUESTIONS[currentQuestionIndex]?.placeholder ||
                              "Typ je antwoord..."
                      }
                      onChange={(e) => {
                        if (editingField) setConfirmInput(e.target.value);
                        else if (confirmationStep)
                          setConfirmInput(e.target.value);
                        else setInputValue(e.target.value);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !isLoading) {
                          if (editingField) handleEditSubmit();
                          else if (confirmationStep) handleConfirmation();
                          else handleSubmitAnswer();
                        }
                      }}
                      disabled={isLoading}
                      className="flex-1 rounded-xl border-2 border-[#d0e0ed] bg-white px-4 py-3 text-base focus:border-[#3690ad] focus:ring-2 focus:ring-[#c5dce8] focus:outline-none disabled:bg-[#f5f5f5]"
                    />

                    <button
                      onClick={handleGoBack}
                      disabled={
                        isLoading ||
                        currentQuestionIndex === 0 ||
                        !!editingField ||
                        !!confirmationStep
                      }
                      className="flex shrink-0 items-center justify-center rounded-xl bg-[#3690ad] px-4 py-3 text-white shadow-lg transition-all hover:bg-[#004070] disabled:cursor-not-allowed disabled:bg-gray-400"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>

                    <button
                      onClick={() => {
                        if (editingField) handleEditSubmit();
                        else if (confirmationStep) handleConfirmation();
                        else handleSubmitAnswer();
                      }}
                      disabled={isLoading || isSubmitInputEmpty()}
                      className="flex shrink-0 items-center justify-center rounded-xl bg-[#3690ad] px-4 py-3 text-white shadow-lg transition-all hover:bg-[#004070] disabled:cursor-not-allowed disabled:bg-gray-400"
                    >
                      {isLoading ? (
                        <Loader className="h-5 w-5 animate-spin" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </>
  );
}
