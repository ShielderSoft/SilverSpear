package com.example.jphish.Dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LearningStatusDto {
    @JsonProperty("status")
    private String TrainingStatus;
    @JsonProperty("correctResponses")
    private Integer answers;
}
